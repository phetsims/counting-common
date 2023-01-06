// Copyright 2021-2022, University of Colorado Boulder

/**
 * Visual view of paper numbers (CountingObject), with stacked images based on the digits of the number.
 *
 * @author Sharfudeen Ashraf
 */

import Emitter from '../../../../axon/js/Emitter.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import { DragListener, Node, PressListenerEvent, Rectangle } from '../../../../scenery/js/imports.js';
import countingCommon from '../../countingCommon.js';
import ArithmeticRules from '../model/ArithmeticRules.js';
import CountingObject from '../model/CountingObject.js';
import BaseNumberNode, { BaseNumberNodeOptions } from './BaseNumberNode.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import CountingObjectType from '../model/CountingObjectType.js';
import merge from '../../../../phet-core/js/merge.js';
import Multilink, { UnknownMultilink } from '../../../../axon/js/Multilink.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import optionize from '../../../../phet-core/js/optionize.js';
import TEmitter from '../../../../axon/js/TEmitter.js';

// types
type CountingObjectNodeOptions = {
  countingObjectTypeProperty?: TReadOnlyProperty<CountingObjectType>;
  baseNumberNodeOptions?: Partial<BaseNumberNodeOptions>;
};

// constants
const MINIMUM_OVERLAP_AMOUNT_TO_COMBINE = 8; // in screen coordinates

class CountingObjectNode extends Node {
  public readonly countingObject: CountingObject;
  public readonly moveEmitter: TEmitter<[ CountingObjectNode ]>;
  public readonly splitEmitter: TEmitter<[ CountingObjectNode ]>;
  public readonly interactionStartedEmitter: TEmitter<[ CountingObjectNode ]>;
  private preventMoveEmit: boolean;
  private readonly availableViewBoundsProperty: TReadOnlyProperty<Bounds2>;
  public readonly countingObjectTypeProperty: TReadOnlyProperty<CountingObjectType>;
  private readonly numberImageContainer: Node;
  private readonly splitTarget: Rectangle;
  private readonly moveTarget: Rectangle;
  private readonly moveDragListener: DragListener;
  private readonly splitDragListener: { down: ( event: PressListenerEvent ) => void };
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

  public readonly endDragEmitter: TEmitter<[ CountingObjectNode ]>;

  public constructor( countingObject: CountingObject, availableViewBoundsProperty: TReadOnlyProperty<Bounds2>, addAndDragNumber: ( event: PressListenerEvent, countingObject: CountingObject ) => void,
                      tryToCombineNumbers: ( countingObject: CountingObject ) => void, providedOptions?: Partial<CountingObjectNodeOptions> ) {

    super();

    const options = optionize<CountingObjectNodeOptions, CountingObjectNodeOptions>()( {
      countingObjectTypeProperty: new EnumerationProperty( CountingObjectType.PAPER_NUMBER ),
      baseNumberNodeOptions: {} // TODO: Only handleYOffset should be exposed here, not all of the options
    }, providedOptions );

    this.countingObject = countingObject;

    // Triggered with self when this paper number node starts to get dragged
    this.moveEmitter = new Emitter( { parameters: [ { valueType: CountingObjectNode } ] } );

    // Triggered with self when this paper number node is split
    this.splitEmitter = new Emitter( { parameters: [ { valueType: CountingObjectNode } ] } );

    // Triggered when user interaction with this paper number begins.
    this.interactionStartedEmitter = new Emitter( { parameters: [ { valueType: CountingObjectNode } ] } );

    // When true, don't emit from the moveEmitter (synthetic drag)
    this.preventMoveEmit = false;

    this.availableViewBoundsProperty = availableViewBoundsProperty;

    // indicates what CountingObjectType this is
    this.countingObjectTypeProperty = options.countingObjectTypeProperty;

    this.baseNumberNodeOptions = options.baseNumberNodeOptions;

    // Fires when the user stops dragging a paper number node.
    this.endDragEmitter = new Emitter( { parameters: [ { valueType: CountingObjectNode } ] } );

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
    this.moveDragListener = new DragListener( {
      targetNode: this,
      pressCursor: 'move', // Our target doesn't have the move cursor, so we need to override here
      start: ( event: PressListenerEvent ) => {
        this.interactionStartedEmitter.emit( this );
        if ( !this.preventMoveEmit ) {
          this.moveEmitter.emit( this );
        }
      },

      drag: ( event: PressListenerEvent, listener: DragListener ) => {
        countingObject.setConstrainedDestination( availableViewBoundsProperty.value, listener.parentPoint, false );
      },

      end: () => {
        if ( !this.isDisposed ) { // check if disposed before handling end, see https://github.com/phetsims/make-a-ten/issues/298
          tryToCombineNumbers( this.countingObject );
          this.endDragEmitter.emit( this );
        }
      }
    } );
    this.moveDragListener.isUserControlledProperty.link( controlled => {
      countingObject.userControlledProperty.value = controlled;
    } );
    this.moveTarget.addInputListener( this.moveDragListener );

    this.splitDragListener = {
      down: event => {
        if ( !event.canStartPress() ) { return; }

        const viewPosition = this.globalToParentPoint( event.pointer.point );

        // Determine how much (if any) gets moved off
        const pulledPlace = countingObject.getBaseNumberAt( this.parentToLocalPoint( viewPosition ) ).place;

        const amountToRemove = ArithmeticRules.pullApartNumbers( countingObject.numberValueProperty.value, pulledPlace );
        const amountRemaining = countingObject.numberValueProperty.value - amountToRemove;

        // it cannot be split - so start moving
        if ( !amountToRemove ) {
          this.startSyntheticDrag( event );
          return;
        }

        countingObject.changeNumber( amountRemaining );

        this.interactionStartedEmitter.emit( this );
        this.splitEmitter.emit( this );

        const newCountingObject = new CountingObject( amountToRemove, countingObject.positionProperty.value, {
          groupingEnabledProperty: countingObject.groupingEnabledProperty
        } );
        addAndDragNumber( event, newCountingObject );
      }
    };
    this.splitTarget.addInputListener( this.splitDragListener );

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

      if ( !countingObject.isAnimating ) {
        countingObject.setConstrainedDestination( this.availableViewBoundsProperty.value, countingObject.positionProperty.value );
      }
    };

    this.countingObjectTypeAndGroupTypeMultilink = null;
  }

  /**
   * Rebuilds the image nodes that display the actual paper number, and resizes the mouse/touch targets.
   */
  public updateNumber(): void {
    const groupingEnabled = this.countingObject.groupingEnabledProperty.value;

    // Reversing allows easier opacity computation and has the nodes in order for setting children.
    const reversedBaseNumbers = this.countingObject.baseNumbers.slice().reverse();

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

    const biggestBaseNumberNode = this.numberImageContainer.children[ 0 ] as BaseNumberNode;

    const fullBounds = this.numberImageContainer.bounds.copy();
    const backgroundNode = biggestBaseNumberNode.backgroundNode;

    // if there is no background node, then this paper number is an object without a background node, so its bounds
    // without a handle are the full bounds. if there is a background, then the bounds of that exclude the handle
    // already, so use that
    const boundsWithoutHandle = backgroundNode ? biggestBaseNumberNode.localToParentBounds( backgroundNode.bounds ) :
                                fullBounds;
    this.countingObject.localBounds = fullBounds;

    // use boundsWithoutHandle for animating back to the creator node because including the handle in the bounds makes
    // the paper numbers animate to the wrong offset (since the creator node is a card without a handle, so
    // the returning object should match its shape).
    this.countingObject.returnAnimationBounds = boundsWithoutHandle;

    if ( groupingEnabled ) {
      this.splitTarget.visible = true;

      let baseNumberNodeHasHandle = false;
      let firstHandleXPosition = 0;
      let lastHandleXPosition = 0;

      this.numberImageContainer.children.forEach( node => {
        const baseNumberNode = node as BaseNumberNode;

        if ( baseNumberNode.handleNode && !firstHandleXPosition ) {
          firstHandleXPosition = baseNumberNode.localToParentBounds( baseNumberNode.handleNode.bounds ).centerX;
          this.handleNode = baseNumberNode.handleNode;
          baseNumberNodeHasHandle = true;
        }
        if ( baseNumberNode.handleNode ) {
          lastHandleXPosition = baseNumberNode.localToParentBounds( baseNumberNode.handleNode.bounds ).centerX;
        }
      } );
      const padding = 18;

      const splitTargetBounds = baseNumberNodeHasHandle ? new Bounds2(
        firstHandleXPosition - padding,
        fullBounds.minY - padding / 2,
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
    this.moveDragListener.press( event );
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
      if ( this.globalToLocalPoint( event.pointer.point ).y < this.splitTarget.bottom && this.countingObject.numberValueProperty.value > 1 ) {
        this.splitDragListener.down( event );
      }
      else {
        this.moveDragListener.press( event );
      }
    }
  }

  /**
   * Implements the API for ClosestDragListener.
   */
  public computeDistance( globalPoint: Vector2 ): number {
    if ( this.countingObject.userControlledProperty.value ) {
      return Number.POSITIVE_INFINITY;
    }
    else {
      const globalBounds = this.localToGlobalBounds( this.countingObject.localBounds );
      return Math.sqrt( globalBounds.minimumDistanceToPointSquared( globalPoint ) );
    }
  }

  /**
   * Attaches listeners to the model. Should be called when added to the scene graph.
   */
  public attachListeners(): void {

    // mirrored unlinks in dispose()
    this.countingObject.handleOpacityProperty.link( this.handleOpacityListener );
    this.countingObject.scaleProperty.link( this.scaleListener );
    this.countingObject.userControlledProperty.link( this.userControlledListener );
    this.countingObject.numberValueProperty.link( this.updateNumberListener );
    this.countingObject.positionProperty.link( this.translationListener );
    this.countingObject.includeInSumProperty.link( this.includeInSumListener );
    this.countingObjectTypeAndGroupTypeMultilink = Multilink.lazyMultilink(
      [ this.countingObjectTypeProperty, this.countingObject.groupingEnabledProperty ],
      this.countingObjectTypeAndGroupTypeListener );
  }

  /**
   * Removes listeners from the model. Should be called when removed from the scene graph.
   */
  public override dispose(): void {
    Multilink.unmultilink( this.countingObjectTypeAndGroupTypeMultilink! );
    this.countingObject.includeInSumProperty.unlink( this.includeInSumListener );
    this.countingObject.positionProperty.unlink( this.translationListener );
    this.countingObject.numberValueProperty.unlink( this.updateNumberListener );
    this.countingObject.userControlledProperty.unlink( this.userControlledListener );
    this.countingObject.scaleProperty.unlink( this.scaleListener );
    this.countingObject.handleOpacityProperty.unlink( this.handleOpacityListener );

    // remove any listeners on the children before detaching them
    this.numberImageContainer.children.forEach( child => child.dispose() );
    super.dispose();
  }

  /**
   * Find all nodes which are attachable to the dragged node. This method is called once the user ends the dragging.
   */
  public findAttachableNodes( allCountingObjectNodes: CountingObjectNode[] ): CountingObjectNode[] {
    const attachableNodeCandidates = allCountingObjectNodes.slice();
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

countingCommon.register( 'CountingObjectNode', CountingObjectNode );

export default CountingObjectNode;