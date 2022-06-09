// Copyright 2021-2022, University of Colorado Boulder

/**
 * Visual view of paper numbers (PaperNumber), with stacked images based on the digits of the number.
 *
 * @author Sharfudeen Ashraf
 */

import Emitter from '../../../../axon/js/Emitter.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import { DragListener, Node, PressListenerEvent, Rectangle } from '../../../../scenery/js/imports.js';
import countingCommon from '../../countingCommon.js';
import ArithmeticRules from '../model/ArithmeticRules.js';
import PaperNumber from '../model/PaperNumber.js';
import BaseNumberNode, { BaseNumberNodeOptions } from './BaseNumberNode.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import CountingObjectType from '../model/CountingObjectType.js';
import merge from '../../../../phet-core/js/merge.js';
import Multilink, { UnknownMultilink } from '../../../../axon/js/Multilink.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import IReadOnlyProperty from '../../../../axon/js/IReadOnlyProperty.js';
import optionize from '../../../../phet-core/js/optionize.js';

// types
type PaperNumberNodeOptions = {
  countingObjectTypeProperty?: IReadOnlyProperty<CountingObjectType>;
  baseNumberNodeOptions?: Partial<BaseNumberNodeOptions>;
}

// constants
const MINIMUM_OVERLAP_AMOUNT_TO_COMBINE = 8; // in screen coordinates

class PaperNumberNode extends Node {
  public readonly paperNumber: PaperNumber;
  public readonly moveEmitter: Emitter<[ PaperNumberNode ]>;
  public readonly splitEmitter: Emitter<[ PaperNumberNode ]>;
  public readonly interactionStartedEmitter: Emitter<[ PaperNumberNode ]>;
  private preventMoveEmit: boolean;
  private readonly availableViewBoundsProperty: Property<Bounds2>;
  public readonly countingObjectTypeProperty: IReadOnlyProperty<CountingObjectType>;
  private readonly numberImageContainer: Node;
  private readonly splitTarget: Rectangle;
  private readonly moveTarget: Rectangle;
  private readonly moveDragHandler: DragListener;
  private readonly splitDragHandler: { down: ( event: PressListenerEvent ) => void };
  private readonly translationListener: ( position: Vector2 ) => void;
  private readonly updateNumberListener: () => void;
  private readonly userControlledListener: ( userControlled: boolean ) => void;
  private readonly baseNumberNodeOptions: Partial<BaseNumberNodeOptions>;
  private readonly scaleListener: ( scale: number ) => void;
  private readonly handleOpacityListener: ( handleOpacity: number ) => void;
  private readonly includeInSumListener: ( includedInSum: boolean ) => void;
  private readonly countingObjectTypeAndGroupTypeListener: ( countingObjectType: CountingObjectType, groupingEnabled: boolean ) => void;

  private countingObjectTypeAndGroupTypeMultilink: UnknownMultilink | null;
  private handleNode: null | Node;

  constructor( paperNumber: PaperNumber, availableViewBoundsProperty: Property<Bounds2>, addAndDragNumber: ( event: PressListenerEvent, paperNumber: PaperNumber ) => void,
               tryToCombineNumbers: ( paperNumber: PaperNumber ) => void, providedOptions?: Partial<PaperNumberNodeOptions> ) {

    super();

    const options = optionize<PaperNumberNodeOptions, PaperNumberNodeOptions>()( {
      countingObjectTypeProperty: new EnumerationProperty( CountingObjectType.PAPER_NUMBER ),
      baseNumberNodeOptions: {} // TODO: Only handleYOffset should be exposed here, not all of the options
    }, providedOptions );

    this.paperNumber = paperNumber;

    // Triggered with self when this paper number node starts to get dragged
    this.moveEmitter = new Emitter( { parameters: [ { valueType: PaperNumberNode } ] } );

    // Triggered with self when this paper number node is split
    this.splitEmitter = new Emitter( { parameters: [ { valueType: PaperNumberNode } ] } );

    // Triggered when user interaction with this paper number begins.
    this.interactionStartedEmitter = new Emitter( { parameters: [ { valueType: PaperNumberNode } ] } );

    // When true, don't emit from the moveEmitter (synthetic drag)
    this.preventMoveEmit = false;

    this.availableViewBoundsProperty = availableViewBoundsProperty;

    // indicates what CountingObjectType this is
    this.countingObjectTypeProperty = options.countingObjectTypeProperty;

    this.baseNumberNodeOptions = options.baseNumberNodeOptions;

    // Container for the digit image nodes
    this.numberImageContainer = new Node( {
      pickable: false
    } );
    this.addChild( this.numberImageContainer );

    this.handleNode = null;

    // Hit target for the "split" behavior, where one number would be pulled off from the existing number.
    this.splitTarget = new Rectangle( 0, 0, 0, 0, {
      cursor: 'pointer'
    } );
    this.addChild( this.splitTarget );

    // Hit target for the "move" behavior, which just drags the existing paper number.
    this.moveTarget = new Rectangle( 0, 0, 100, 100, {
      cursor: 'move'
    } );
    this.addChild( this.moveTarget );

    // View-coordinate offset between our position and the pointer's position, used for keeping drags synced.
    this.moveDragHandler = new DragListener( {
      targetNode: this,
      pressCursor: 'move', // Our target doesn't have the move cursor, so we need to override here
      start: ( event: PressListenerEvent ) => {
        this.interactionStartedEmitter.emit( this );
        if ( !this.preventMoveEmit ) {
          this.moveEmitter.emit( this );
        }
      },

      drag: ( event: PressListenerEvent, listener: DragListener ) => {
        paperNumber.setConstrainedDestination( availableViewBoundsProperty.value, listener.parentPoint, false );
      },

      end: () => {
        if ( !this.isDisposed ) { // check if disposed before handling end, see https://github.com/phetsims/make-a-ten/issues/298
          tryToCombineNumbers( this.paperNumber );
          paperNumber.endDragEmitter.emit( paperNumber );
        }
      }
    } );
    this.moveDragHandler.isUserControlledProperty.link( controlled => {
      paperNumber.userControlledProperty.value = controlled;
    } );
    this.moveTarget.addInputListener( this.moveDragHandler );

    this.splitDragHandler = {
      down: event => {
        if ( !event.canStartPress() ) { return; }

        const viewPosition = this.globalToParentPoint( event.pointer.point );

        // Determine how much (if any) gets moved off
        const pulledPlace = paperNumber.getBaseNumberAt( this.parentToLocalPoint( viewPosition ) ).place;

        const amountToRemove = ArithmeticRules.pullApartNumbers( paperNumber.numberValueProperty.value, pulledPlace );
        const amountRemaining = paperNumber.numberValueProperty.value - amountToRemove;

        // it cannot be split - so start moving
        if ( !amountToRemove ) {
          this.startSyntheticDrag( event );
          return;
        }

        paperNumber.changeNumber( amountRemaining );

        this.interactionStartedEmitter.emit( this );
        this.splitEmitter.emit( this );

        const newPaperNumber = new PaperNumber( amountToRemove, paperNumber.positionProperty.value, {
          groupingEnabledProperty: paperNumber.groupingEnabledProperty
        } );
        addAndDragNumber( event, newPaperNumber );
      }
    };
    this.splitTarget.addInputListener( this.splitDragHandler );

    // Listener that hooks model position to view translation.
    this.translationListener = position => {
      this.translation = position;
    };

    // Listener for when our scale changes
    this.scaleListener = scale => {
      this.setScaleMagnitude( scale );
    };

    // Listener for when the handle opacity changes in the model
    this.handleOpacityListener = handleOpacity => {
      this.handleNode && this.handleNode.setOpacity( handleOpacity );
    };

    // Listener for when our number changes
    this.updateNumberListener = this.updateNumber.bind( this );

    // Listener reference that gets attached/detached. Handles moving the Node to the front.
    this.userControlledListener = userControlled => {
      if ( userControlled ) {
        this.moveToFront();
      }
    };

    // Listener for when whether the paper number's value is included in the sum changes
    this.includeInSumListener = includedInSum => {
      if ( !includedInSum ) {
        this.interruptSubtreeInput();
        this.pickable = false;
      }
    };

    // Listener for when our counting type or group type changes
    this.countingObjectTypeAndGroupTypeListener = ( countingObjectType: CountingObjectType, groupingEnabled: boolean ) => {
      this.updateNumber();

      if ( !paperNumber.isAnimating ) {
        paperNumber.setConstrainedDestination( this.availableViewBoundsProperty.value, paperNumber.positionProperty.value );
      }
    };

    this.countingObjectTypeAndGroupTypeMultilink = null;
  }

  /**
   * Rebuilds the image nodes that display the actual paper number, and resizes the mouse/touch targets.
   */
  public updateNumber(): void {
    const groupingEnabled = this.paperNumber.groupingEnabledProperty.value;

    // Reversing allows easier opacity computation and has the nodes in order for setting children.
    const reversedBaseNumbers = this.paperNumber.baseNumbers.slice().reverse();

    this.numberImageContainer.children = _.map( reversedBaseNumbers, ( baseNumber, index ) => {
      const hasDescendant = reversedBaseNumbers[ index + 1 ] !== undefined;

      return new BaseNumberNode(
        baseNumber,
        0.95 * Math.pow( 0.97, index ), merge( {
          countingObjectType: this.countingObjectTypeProperty.value,
          includeHandles: true,
          groupingEnabled: groupingEnabled,
          isLargestBaseNumber: index === 0,
          hasDescendant: hasDescendant,
          isPartOfStack: reversedBaseNumbers.length > 1
        }, this.baseNumberNodeOptions ) );
    } );

    const biggestBaseNumberNode = this.numberImageContainer.children[ 0 ];

    const fullBounds = this.numberImageContainer.bounds.copy();
    // @ts-ignore
    const backgroundNode = biggestBaseNumberNode.backgroundNode;

    // if there is no background node, then this paper number is an object without a background node, so its bounds
    // without a handle are the full bounds. if there is a background, then the bounds of that exclude the handle
    // already, so use that
    const boundsWithoutHandle = backgroundNode ? biggestBaseNumberNode.localToParentBounds( backgroundNode.bounds ) :
                                fullBounds;
    this.paperNumber.localBounds = fullBounds;

    // use boundsWithoutHandle for animating back to the creator node because including the handle in the bounds makes
    // the paper numbers animate to the wrong offset (since the creator node is a card without a handle, so
    // the returning object should match its shape).
    this.paperNumber.returnAnimationBounds = boundsWithoutHandle;

    if ( groupingEnabled ) {
      this.splitTarget.visible = true;

      let firstHandleXPosition: number;
      let lastHandleXPosition;

      // @ts-ignore
      this.numberImageContainer.children.forEach( ( baseNumberNode: BaseNumberNode ) => {
        if ( baseNumberNode.handleNode && !firstHandleXPosition ) {
          firstHandleXPosition = baseNumberNode.localToParentBounds( baseNumberNode.handleNode.bounds ).centerX;
          this.handleNode = baseNumberNode.handleNode;
        }
        if ( baseNumberNode.handleNode ) {
          lastHandleXPosition = baseNumberNode.localToParentBounds( baseNumberNode.handleNode.bounds ).centerX;
        }
      } );
      const padding = 18;

      // @ts-ignore TODO-TS: needs refactor
      const splitTargetBounds = firstHandleXPosition ? new Bounds2(
        firstHandleXPosition - padding,
        fullBounds.minY - padding / 2,
        // @ts-ignore TODO-TS: needs refactor
        lastHandleXPosition + padding,
        boundsWithoutHandle.minY
      ) : new Bounds2( 0, 0, 0, 0 );

      this.moveTarget.mouseArea = this.moveTarget.touchArea = this.moveTarget.rectBounds = boundsWithoutHandle;
      this.splitTarget.mouseArea = this.splitTarget.touchArea = this.splitTarget.rectBounds = splitTargetBounds;
    }
    else {
      this.splitTarget.visible = false;
      this.moveTarget.mouseArea = this.moveTarget.touchArea = this.moveTarget.rectBounds = boundsWithoutHandle;
      this.splitTarget.mouseArea = this.splitTarget.touchArea = this.splitTarget.rectBounds = new Bounds2( 0, 0, 0, 0 );
    }

    // Changing the number must have happened from an interaction. If combined, we want to put cues on this.
    this.interactionStartedEmitter.emit( this );
  }

  /**
   * Called when we grab an event from a different input (like clicking the paper number in the explore panel, or
   * splitting paper numbers), and starts a drag on this paper number.
   *
   * @param event - Scenery event from the relevant input handler
   */
  public startSyntheticDrag( event: PressListenerEvent ): void {
    // Don't emit a move event, as we don't want the cue to disappear.
    this.preventMoveEmit = true;
    this.moveDragHandler.press( event );
    this.preventMoveEmit = false;
  }

  /**
   * Implements the API for ClosestDragListener. Only pass through events if this paper number is still pickable, see
   * https://github.com/phetsims/number-play/issues/39
   *
   * @param event - Scenery event from the relevant input handler
   */
  public startDrag( event: PressListenerEvent ): void {
    if ( this.pickable !== false ) {
      if ( this.globalToLocalPoint( event.pointer.point as Vector2 ).y < this.splitTarget.bottom && this.paperNumber.numberValueProperty.value > 1 ) {
        this.splitDragHandler.down( event );
      }
      else {
        this.moveDragHandler.press( event );
      }
    }
  }

  /**
   * Implements the API for ClosestDragListener.
   */
  public computeDistance( globalPoint: Vector2 ): number {
    if ( this.paperNumber.userControlledProperty.value ) {
      return Number.POSITIVE_INFINITY;
    }
    else {
      const globalBounds = this.localToGlobalBounds( this.paperNumber.localBounds );
      return Math.sqrt( globalBounds.minimumDistanceToPointSquared( globalPoint ) );
    }
  }

  /**
   * Attaches listeners to the model. Should be called when added to the scene graph.
   */
  public attachListeners(): void {

    // mirrored unlinks in dispose()
    this.paperNumber.handleOpacityProperty.link( this.handleOpacityListener );
    this.paperNumber.scaleProperty.link( this.scaleListener );
    this.paperNumber.userControlledProperty.link( this.userControlledListener );
    this.paperNumber.numberValueProperty.link( this.updateNumberListener );
    this.paperNumber.positionProperty.link( this.translationListener );
    this.paperNumber.includeInSumProperty.link( this.includeInSumListener );
    this.countingObjectTypeAndGroupTypeMultilink = Multilink.lazyMultilink(
      [ this.countingObjectTypeProperty, this.paperNumber.groupingEnabledProperty ],
      this.countingObjectTypeAndGroupTypeListener );
  }

  /**
   * Removes listeners from the model. Should be called when removed from the scene graph.
   */
  public override dispose(): void {
    Multilink.unmultilink( this.countingObjectTypeAndGroupTypeMultilink! );
    this.paperNumber.includeInSumProperty.unlink( this.includeInSumListener );
    this.paperNumber.positionProperty.unlink( this.translationListener );
    this.paperNumber.numberValueProperty.unlink( this.updateNumberListener );
    this.paperNumber.userControlledProperty.unlink( this.userControlledListener );
    this.paperNumber.scaleProperty.unlink( this.scaleListener );
    this.paperNumber.handleOpacityProperty.unlink( this.handleOpacityListener );

    // remove any listeners on the children before detaching them
    this.numberImageContainer.children.forEach( child => child.dispose() );
    super.dispose();
  }

  /**
   * Find all nodes which are attachable to the dragged node. This method is called once the user ends the dragging.
   */
  public findAttachableNodes( allPaperNumberNodes: PaperNumberNode[] ): PaperNumberNode[] {
    const attachableNodeCandidates = allPaperNumberNodes.slice();
    arrayRemove( attachableNodeCandidates, this );

    // find all other paper number nodes that are overlapping the dropped node
    const unorderedAttachableNodes = attachableNodeCandidates.filter( candidateNode => {
      return candidateNode.localToParentBounds( candidateNode.moveTarget.bounds ).eroded( MINIMUM_OVERLAP_AMOUNT_TO_COMBINE )
        .intersectsBounds( this.localToParentBounds( this.moveTarget.bounds ).eroded( MINIMUM_OVERLAP_AMOUNT_TO_COMBINE ) );
    } );

    // sort by how much area they are overlapping the dropped node
    return _.sortBy( unorderedAttachableNodes, attachableNode => {
      const overlappingBounds = attachableNode.moveTarget.bounds.intersection( this.moveTarget.bounds );
      return overlappingBounds.width * overlappingBounds.height;
    } );
  }
}

countingCommon.register( 'PaperNumberNode', PaperNumberNode );

export default PaperNumberNode;