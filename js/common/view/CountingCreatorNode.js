// Copyright 2021, University of Colorado Boulder

/**
 * Node that can display a 1, 10, 100, or play object which can be clicked/dragged to create draggable paper numbers or
 * play objects. Factored out from ExplorePanel.js in make-a-ten, see https://github.com/phetsims/number-play/issues/19
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import BaseNumber from '../../../../counting-common/js/common/model/BaseNumber.js';
import PaperNumber from '../../../../counting-common/js/common/model/PaperNumber.js';
import BaseNumberNode from '../../../../counting-common/js/common/view/BaseNumberNode.js';
import BasePictorialNode from '../../../../counting-common/js/common/view/BasePictorialNode.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import { Node } from '../../../../scenery/js/imports.js';
import countingCommon from '../../countingCommon.js';

class CountingCreatorNode extends Node {

  /**
   * @param {number} place
   * @param {CountingCommonView} screenView
   * @param {NumberProperty} sumProperty
   * @param {Object} [options]
   */
  constructor( place, screenView, sumProperty, options ) {

    options = merge( {
      updateCurrentNumber: false,
      playObjectTypeProperty: null // {EnumerationProperty.<PlayObjectType>|null}
    }, options );

    super();

    assert && assert( sumProperty.range, `Range is required: ${sumProperty.range}` );
    const maxSum = sumProperty.range.max;

    // @private {CountingCommonView}
    this.screenView = screenView;

    /**
     * @param {number} offset
     * @returns {BaseNumberNode|BasePictorialNode}
     */
    const createSingleTargetNode = offset => {
      let targetNode;

      // TODO: needs attention, see https://github.com/phetsims/number-play/issues/19
      if ( options.playObjectTypeProperty ) {
        targetNode = new BasePictorialNode( new BaseNumber( 1, place ), 1, false, options.playObjectTypeProperty, true );
        targetNode.scale( 0.85 );
      }
      else {
        targetNode = new BaseNumberNode( new BaseNumber( 1, place ), 1, false );
        targetNode.scale( 0.64, 0.55 );
      }
      targetNode.translation = offset;
      return targetNode;
    };

    const numberValue = Math.pow( 10, place );

    // empirically determined stacking
    const backTargetNode = createSingleTargetNode( new Vector2( -9, -9 ) );
    const frontTargetNode = createSingleTargetNode( new Vector2( 0, 0 ) );

    // @private {Node}
    this.targetNode = new Node( {
      cursor: 'pointer',
      children: [ backTargetNode, frontTargetNode ]
    } );
    this.targetNode.touchArea = this.targetNode.localBounds.dilatedX( 15 ).dilatedY( 5 );

    // We need to be disabled if adding this number would increase the sum past the maximum sum.
    new DerivedProperty( [ sumProperty ], sum => sum + numberValue <= maxSum ).linkAttribute( this.targetNode, 'visible' );

    // Don't show the one of the two parts of the target node if adding two numbers would increase the sum past the
    // maximum sum.
    new DerivedProperty( [ sumProperty ],
      sum => sum + numberValue + numberValue <= maxSum ).linkAttribute( backTargetNode, 'visible' );

    this.targetNode.addInputListener( {
      down: event => {
        if ( !event.canStartPress() ) { return; }

        // We want this relative to the screen view, so it is guaranteed to be the proper view coordinates.
        const viewPosition = screenView.globalToLocalPoint( event.pointer.point );
        const paperNumber = new PaperNumber( numberValue, new Vector2( 0, 0 ) );

        // TODO: needs improvement, magic values determined from bounds of rendered play object nodes, see https://github.com/phetsims/number-play/issues/19
        const dragTargetOffset = options.playObjectTypeProperty ? new Vector2( 41, 57 ) : paperNumber.getDragTargetOffset();

        // Once we have the number's bounds, we set the position so that our pointer is in the middle of the drag target.
        paperNumber.setDestination( viewPosition.minus( dragTargetOffset ), false );

        // Create and start dragging the new paper number node
        screenView.addAndDragNumber( event, paperNumber );

        // TODO: the need for this guard means that the play areas are not in sync, and should be eliminated when https://github.com/phetsims/number-play/issues/6 is fixed.
        if ( options.updateCurrentNumber &&
             screenView.playArea.currentNumberProperty.value < screenView.playArea.currentNumberProperty.range.max ) {

          // a user grabbed a new number, so update the sim's currentNumberProperty
          screenView.playArea.isControllingCurrentNumber = true;
          screenView.playArea.currentNumberProperty.value++;
          screenView.playArea.isControllingCurrentNumber = false;
        }
      }
    } );

    this.addChild( this.targetNode );
  }

  /**
   * Return the view coordinates of the target.
   * @public
   *
   * @returns {Vector2}
   */
  getOriginPosition() {

    // Trail to screenView, not including the screenView
    let trail = this.screenView.getUniqueLeafTrailTo( this.targetNode );
    trail = trail.slice( 1, trail.length );

    // Transformed to view coordinates
    return trail.localToGlobalPoint( this.targetNode.localBounds.center );
  }
}

countingCommon.register( 'CountingCreatorNode', CountingCreatorNode );
export default CountingCreatorNode;
