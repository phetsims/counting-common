// Copyright 2021-2022, University of Colorado Boulder

/**
 * Visual view of paper numbers (PaperNumber), with stacked images based on the digits of the number.
 *
 * @author Sharfudeen Ashraf
 */

import Emitter from '../../../../axon/js/Emitter.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import { DragListener, Node, Rectangle } from '../../../../scenery/js/imports.js';
import countingCommon from '../../countingCommon.js';
import ArithmeticRules from '../model/ArithmeticRules.js';
import BaseNumber from '../model/BaseNumber.js';
import PaperNumber from '../model/PaperNumber.js';
import BaseNumberNode from './BaseNumberNode.js';
import BasePictorialNode from './BasePictorialNode.js';

class PaperNumberNode extends Node {
  /**
   * @param {PaperNumber} paperNumber
   * @param {Property.<Bounds2>} availableViewBoundsProperty
   * @param {Function} addAndDragNumber - function( event, paperNumber ), adds and starts a drag for a number
   * @param {Function} tryToCombineNumbers - function( paperNumber ), called to combine our paper number
   * @param {RichEnumerationProperty.<PlayObjectType>|null} playObjectTypeProperty
   * @param {Property<GroupingLinkingType>|null} groupingLinkingTypeProperty
   */
  constructor( paperNumber, availableViewBoundsProperty, addAndDragNumber, tryToCombineNumbers,
               playObjectTypeProperty = null, groupingLinkingTypeProperty = null ) {

    super();

    // @public {PaperNumber} - Our model
    this.paperNumber = paperNumber;

    // @public {Emitter} - Triggered with self when this paper number node starts to get dragged
    this.moveEmitter = new Emitter( { parameters: [ { valueType: PaperNumberNode } ] } );

    // @public {Emitter} - Triggered with self when this paper number node is split
    this.splitEmitter = new Emitter( { parameters: [ { valueType: PaperNumberNode } ] } );

    // @public {Emitter} - Triggered when user interaction with this paper number begins.
    this.interactionStartedEmitter = new Emitter( { parameters: [ { valueType: PaperNumberNode } ] } );

    // @private {boolean} - When true, don't emit from the moveEmitter (synthetic drag)
    this.preventMoveEmit = false;

    // @private {Bounds2}
    this.availableViewBoundsProperty = availableViewBoundsProperty;

    // @private {RichEnumerationProperty.<PlayObjectType>|null}
    this.playObjectTypeProperty = playObjectTypeProperty;

    // @private {RichEnumerationProperty.<GroupingLinkingType>|null}
    this.groupingLinkingTypeProperty = groupingLinkingTypeProperty;

    // @private {Node} - Container for the digit image nodes
    this.numberImageContainer = new Node( {
      pickable: false
    } );
    this.addChild( this.numberImageContainer );

    // @private {Rectangle} - Hit target for the "split" behavior, where one number would be pulled off from the
    //                        existing number.
    this.splitTarget = new Rectangle( 0, 0, 0, 0, {
      cursor: 'pointer'
    } );
    this.addChild( this.splitTarget );

    // @private {Rectangle} - Hit target for the "move" behavior, which just drags the existing paper number.
    this.moveTarget = new Rectangle( 0, 0, 100, 100, {
      cursor: 'move'
    } );
    this.addChild( this.moveTarget );

    // View-coordinate offset between our position and the pointer's position, used for keeping drags synced.
    // @private {DragListener}
    this.moveDragHandler = new DragListener( {
      targetNode: this,
      pressCursor: 'move', // Our target doesn't have the move cursor, so we need to override here
      start: ( event, listener ) => {
        this.interactionStartedEmitter.emit( this );
        if ( !this.preventMoveEmit ) {
          this.moveEmitter.emit( this );
        }
      },

      drag: ( event, listener ) => {
        paperNumber.setConstrainedDestination( availableViewBoundsProperty.value, listener.parentPoint, false,
          !!this.playObjectTypeProperty );
      },

      end: ( event, listener ) => {
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

    // @private {Object}
    this.splitDragHandler = {
      down: event => {
        if ( !event.canStartPress() ) { return; }

        const viewPosition = this.globalToParentPoint( event.pointer.point );

        // Determine how much (if any) gets moved off
        const pulledPlace = paperNumber.getBaseNumberAt( this.parentToLocalPoint( viewPosition ) ).place;

        // TODO, handle this in general way, see https://github.com/phetsims/number-play/issues/51
        const amountToRemoveIfPaper = ArithmeticRules.pullApartNumbers( paperNumber.numberValueProperty.value, pulledPlace );
        const amountToRemove = this.playObjectTypeProperty && amountToRemoveIfPaper > 1 ? 1 : amountToRemoveIfPaper;
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

    // @private {Function} - Listener that hooks model position to view translation.
    this.translationListener = position => {
      this.translation = position;
    };

    // @private {Function} - Listener for when our number changes
    this.updateNumberListener = this.updateNumber.bind( this );

    // @private {Function} - Listener reference that gets attached/detached. Handles moving the Node to the front.
    this.userControlledListener = userControlled => {
      if ( userControlled ) {
        this.moveToFront();
      }
    };
  }

  /**
   * Rebuilds the image nodes that display the actual paper number, and resizes the mouse/touch targets.
   * @public
   */
  updateNumber() {
    const breakApartNumbers = this.groupingLinkingTypeProperty &&
                              this.groupingLinkingTypeProperty.value === 'UNGROUPED';

    // Reversing allows easier opacity computation and has the nodes in order for setting children.
    const reversedBaseNumbers = this.paperNumber.baseNumbers.slice().reverse();

    let fullBounds;

    // TODO: needs improvement, see https://github.com/phetsims/number-play/issues/19
    if ( this.playObjectTypeProperty ) {
      const basePictorialNode = new BasePictorialNode( reversedBaseNumbers[ reversedBaseNumbers.length - 1 ], this.paperNumber.numberValueProperty.value,
        reversedBaseNumbers.length > 1, this.playObjectTypeProperty, breakApartNumbers );
      this.numberImageContainer.children = [ basePictorialNode ];

      const backgroundNode = basePictorialNode.backgroundNode;
      fullBounds = backgroundNode ? basePictorialNode.localToParentBounds( backgroundNode.bounds ) :
                   this.numberImageContainer.bounds;
    }
    else {
      this.numberImageContainer.children = _.map( reversedBaseNumbers, ( baseNumber, index ) => {
        const hasDescendant = reversedBaseNumbers[ index + 1 ] !== undefined;

        return new BaseNumberNode(
          baseNumber,
          0.95 * Math.pow( 0.97, index ),
          true,
          index === 0,
          hasDescendant,
          reversedBaseNumbers.length > 1
        );
      } );

      // Grab the bounds of the biggest base number for the full bounds
      fullBounds = this.paperNumber.baseNumbers[ this.paperNumber.baseNumbers.length - 1 ].bounds;
    }

    this.paperNumber.alternateBounds = this.numberImageContainer.bounds.copy();

    if ( !breakApartNumbers ) {
      this.splitTarget.visible = true;

      let firstHandleXPosition;
      let lastHandleXPosition;

      this.numberImageContainer.children.forEach( baseNumberNode => {
        if ( baseNumberNode.handleStemNode && !firstHandleXPosition ) {
          firstHandleXPosition = baseNumberNode.localToParentBounds( baseNumberNode.handleStemNode.bounds ).centerX;
        }
        if ( baseNumberNode.handleStemNode ) {
          lastHandleXPosition = baseNumberNode.localToParentBounds( baseNumberNode.handleStemNode.bounds ).centerX;
        }
      } );
      const padding = 18;

      const splitTargetBounds = firstHandleXPosition ? new Bounds2(
        firstHandleXPosition - padding,
        this.numberImageContainer.bounds.minY - padding / 2,
        lastHandleXPosition + padding,
        fullBounds.minY
      ) : new Bounds2( 0, 0, 0, 0 );

      this.moveTarget.mouseArea = this.moveTarget.touchArea = this.moveTarget.rectBounds = fullBounds;
      this.splitTarget.mouseArea = this.splitTarget.touchArea = this.splitTarget.rectBounds = splitTargetBounds;
    }
    else {
      this.splitTarget.visible = true;
      this.moveTarget.mouseArea = this.moveTarget.touchArea = this.moveTarget.rectBounds = new Bounds2( 0, 0, 0, 0 );
      this.splitTarget.mouseArea = this.splitTarget.touchArea = this.splitTarget.rectBounds = fullBounds;
    }

    // Changing the number must have happened from an interaction. If combined, we want to put cues on this.
    this.interactionStartedEmitter.emit( this );
  }

  /**
   * Called when we grab an event from a different input (like clicking the paper number in the explore panel, or
   * splitting paper numbers), and starts a drag on this paper number.
   * @public
   *
   * @param {SceneryEvent} event - Scenery event from the relevant input handler
   */
  startSyntheticDrag( event ) {
    // Don't emit a move event, as we don't want the cue to disappear.
    this.preventMoveEmit = true;
    this.moveDragHandler.press( event );
    this.preventMoveEmit = false;
  }

  /**
   * Implements the API for ClosestDragListener. Only pass through events if this paper number is still pickable, see
   * https://github.com/phetsims/number-play/issues/39
   * @public
   *
   * @param {SceneryEvent} event - Scenery event from the relevant input handler
   */
  startDrag( event ) {
    if ( this.pickable !== false ) {
      if ( this.globalToLocalPoint( event.pointer.point ).y < this.splitTarget.bottom && this.paperNumber.numberValueProperty.value > 1 ) {
        this.splitDragHandler.down( event );
      }
      else {
        this.moveDragHandler.press( event );
      }
    }
  }

  /**
   * Implements the API for ClosestDragListener.
   * @public
   *
   * @param {Vector2} globalPoint
   */
  computeDistance( globalPoint ) {
    if ( this.paperNumber.userControlledProperty.value ) {
      return Number.POSITIVE_INFINITY;
    }
    else {
      const globalBounds = this.localToGlobalBounds( this.paperNumber.getLocalBounds() );
      return Math.sqrt( globalBounds.minimumDistanceToPointSquared( globalPoint ) );
    }
  }

  /**
   * Attaches listeners to the model. Should be called when added to the scene graph.
   * @public
   */
  attachListeners() {
    // mirrored unlinks in detachListeners()
    this.paperNumber.userControlledProperty.link( this.userControlledListener );
    this.paperNumber.numberValueProperty.link( this.updateNumberListener );
    this.paperNumber.positionProperty.link( this.translationListener );
  }

  /**
   * Removes listeners from the model. Should be called when removed from the scene graph.
   * @public
   */
  dispose() {
    this.paperNumber.positionProperty.unlink( this.translationListener );
    this.paperNumber.numberValueProperty.unlink( this.updateNumberListener );
    this.paperNumber.userControlledProperty.unlink( this.userControlledListener );

    // remove any listeners on the children before detaching them
    this.numberImageContainer.children.forEach( child => child.dispose() );
    super.dispose();
  }

  /**
   * Find all nodes which are attachable to the dragged node. This method is called once the user ends the dragging.
   * @public
   *
   * @param {Array.<PaperNumberNode>} allPaperNumberNodes
   * @returns {Array}
   */
  findAttachableNodes( allPaperNumberNodes ) {
    const attachableNodeCandidates = allPaperNumberNodes.slice();
    arrayRemove( attachableNodeCandidates, this );

    // find all other paper number nodes that are overlapping the dropped node
    const unorderedAttachableNodes = attachableNodeCandidates.filter( candidateNode => {
      return candidateNode.localToParentBounds( candidateNode.moveTarget.bounds )
        .intersectsBounds( this.localToParentBounds( this.moveTarget.bounds ) );
    } );

    // sort by how much area they are overlapping the dropped node
    return _.sortBy( unorderedAttachableNodes, attachableNode => {
      const overlappingBounds = attachableNode.moveTarget.bounds.intersection( this.moveTarget.bounds );
      return overlappingBounds.width * overlappingBounds.height;
    } );
  }

  /**
   * Given a number's digit and place, looks up the associated image.
   * @public
   *
   * @param {number} digit
   * @param {number} place
   * @returns {HTMLImageElement}
   */
  static getNumberImage( digit, place ) {
    return new BaseNumberNode( new BaseNumber( digit, place ), 1 );
  }
}

countingCommon.register( 'PaperNumberNode', PaperNumberNode );

export default PaperNumberNode;