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
import { DragListener, Node, Rectangle, SceneryEvent } from '../../../../scenery/js/imports.js';
import countingCommon from '../../countingCommon.js';
import ArithmeticRules from '../model/ArithmeticRules.js';
import GroupType from '../model/GroupType.js';
import PaperNumber from '../model/PaperNumber.js';
import BaseNumberNode, { BaseNumberNodeOptions } from './BaseNumberNode.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import IReadOnlyProperty from '../../../../axon/js/IReadOnlyProperty.js';
import CountingObjectType from '../model/CountingObjectType.js';
import merge from '../../../../phet-core/js/merge.js';

// types
type PaperNumberNodeOptions = {
  groupTypeProperty: IReadOnlyProperty<GroupType> | null,
  baseNumberNodeOptions: Partial<BaseNumberNodeOptions>
}

// constants
const MINIMUM_OVERLAP_AMOUNT_TO_COMBINE = 8; // in screen coordinates

class PaperNumberNode extends Node {
  public readonly paperNumber: PaperNumber;
  public readonly moveEmitter: Emitter<any>;
  public readonly splitEmitter: Emitter<any>;
  public readonly interactionStartedEmitter: Emitter<any>;
  private preventMoveEmit: boolean;
  private readonly availableViewBoundsProperty: Property<Bounds2>;
  private readonly playObjectTypeProperty: IReadOnlyProperty<CountingObjectType>;
  private readonly groupTypeProperty: IReadOnlyProperty<GroupType> | null;
  private readonly numberImageContainer: Node;
  private readonly splitTarget: Rectangle;
  private readonly moveTarget: Rectangle;
  private readonly moveDragHandler: DragListener;
  private readonly splitDragHandler: { down: ( event: any ) => void; };
  private readonly translationListener: ( position: any ) => void;
  private readonly updateNumberListener: () => void;
  private readonly userControlledListener: ( userControlled: any ) => void;
  private readonly baseNumberNodeOptions: Partial<BaseNumberNodeOptions>;
  private readonly scaleListener: ( scale: number ) => void;

  /**
   * @param paperNumber
   * @param availableViewBoundsProperty
   * @param addAndDragNumber - function( event, paperNumber ), adds and starts a drag for a number
   * @param tryToCombineNumbers - function( paperNumber ), called to combine our paper number
   * @param playObjectTypeProperty
   * @param providedOptions
   */
  constructor( paperNumber: PaperNumber, availableViewBoundsProperty: Property<Bounds2>, addAndDragNumber: Function,
               tryToCombineNumbers: Function, playObjectTypeProperty: IReadOnlyProperty<CountingObjectType>,
               providedOptions?: Partial<PaperNumberNodeOptions> ) {

    super();

    const options = merge( {
      groupTypeProperty: null,
      baseNumberNodeOptions: {} // TODO: Only handleYOffset should be exposed here, not all of the options
    }, providedOptions ) as PaperNumberNodeOptions;

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

    this.playObjectTypeProperty = playObjectTypeProperty;
    this.groupTypeProperty = options.groupTypeProperty;
    this.baseNumberNodeOptions = options.baseNumberNodeOptions;

    // Container for the digit image nodes
    this.numberImageContainer = new Node( {
      pickable: false
    } );
    this.addChild( this.numberImageContainer );

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
      start: ( event: Event ) => {
        this.interactionStartedEmitter.emit( this );
        if ( !this.preventMoveEmit ) {
          this.moveEmitter.emit( this );
        }
      },

      drag: ( event: Event, listener: DragListener ) => {
        paperNumber.setConstrainedDestination( availableViewBoundsProperty.value, listener.parentPoint, false );
      },

      end: ( event: Event ) => {
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

        const newPaperNumber = new PaperNumber( amountToRemove, paperNumber.positionProperty.value );
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

    // Listener for when our number changes
    this.updateNumberListener = this.updateNumber.bind( this );

    // Listener reference that gets attached/detached. Handles moving the Node to the front.
    this.userControlledListener = userControlled => {
      if ( userControlled ) {
        this.moveToFront();
      }
    };

    // Listener for when our type changes
    this.playObjectTypeProperty.lazyLink( playObjectType => {
      this.updateNumber();
    } );
  }

  /**
   * Rebuilds the image nodes that display the actual paper number, and resizes the mouse/touch targets.
   */
  public updateNumber(): void {
    let isGroupable = true;
    if ( this.groupTypeProperty && this.groupTypeProperty.value === GroupType.UNGROUPED ) {
      isGroupable = false;
    }

    // Reversing allows easier opacity computation and has the nodes in order for setting children.
    const reversedBaseNumbers = this.paperNumber.baseNumbers.slice().reverse();

    this.numberImageContainer.children = _.map( reversedBaseNumbers, ( baseNumber, index ) => {
      const hasDescendant = reversedBaseNumbers[ index + 1 ] !== undefined;

      return new BaseNumberNode(
        baseNumber,
        0.95 * Math.pow( 0.97, index ), merge( {
          playObjectTypeProperty: this.playObjectTypeProperty,
          includeHandles: true,
          isGroupable: isGroupable,
          isLargestBaseNumber: index === 0,
          hasDescendant: hasDescendant,
          isPartOfStack: reversedBaseNumbers.length > 1
        }, this.baseNumberNodeOptions ) );
    } );

    const biggestBaseNumberNode = this.numberImageContainer.children[ 0 ];

    const fullBounds = this.numberImageContainer.bounds.copy();
    // @ts-ignore
    const backgroundNode = biggestBaseNumberNode.backgroundNode;
    const boundsWithoutHandle = backgroundNode ? biggestBaseNumberNode.localToParentBounds( backgroundNode.bounds ) :
                                fullBounds;
    this.paperNumber.localBounds = fullBounds;

    if ( isGroupable ) {
      this.splitTarget.visible = true;

      let firstHandleXPosition: number;
      let lastHandleXPosition;

      // @ts-ignore
      this.numberImageContainer.children.forEach( ( baseNumberNode: BaseNumberNode ) => {
        if ( baseNumberNode.handleStemNode && !firstHandleXPosition ) {
          firstHandleXPosition = baseNumberNode.localToParentBounds( baseNumberNode.handleStemNode.bounds ).centerX;
        }
        if ( baseNumberNode.handleStemNode ) {
          lastHandleXPosition = baseNumberNode.localToParentBounds( baseNumberNode.handleStemNode.bounds ).centerX;
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
  public startSyntheticDrag( event: SceneryEvent ): void {
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
  public startDrag( event: SceneryEvent ): void {
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
    // mirrored unlinks in detachListeners()
    this.paperNumber.scaleProperty.link( this.scaleListener );
    this.paperNumber.userControlledProperty.link( this.userControlledListener );
    this.paperNumber.numberValueProperty.link( this.updateNumberListener );
    this.paperNumber.positionProperty.link( this.translationListener );
  }

  /**
   * Removes listeners from the model. Should be called when removed from the scene graph.
   */
  public dispose(): void {
    this.paperNumber.positionProperty.unlink( this.translationListener );
    this.paperNumber.numberValueProperty.unlink( this.updateNumberListener );
    this.paperNumber.userControlledProperty.unlink( this.userControlledListener );
    this.paperNumber.scaleProperty.unlink( this.scaleListener );

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