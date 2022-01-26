// Copyright 2021-2022, University of Colorado Boulder

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
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import { Node } from '../../../../scenery/js/imports.js';
import countingCommon from '../../countingCommon.js';
import CountingCommonView from './CountingCommonView.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import CountingObjectType from '../model/CountingObjectType.js';

// types
type CountingCreatorNodeOptions = {
  updateCurrentNumber: boolean,
  playObjectTypeProperty: EnumerationProperty<CountingObjectType>
};

class CountingCreatorNode extends Node {
  private screenView: CountingCommonView;
  private readonly targetNode: Node;

  constructor( place: number, screenView: CountingCommonView, sumProperty: NumberProperty, providedOptions: Partial<CountingCreatorNodeOptions> ) {

    const options = merge( {
      updateCurrentNumber: false,
      playObjectTypeProperty: new EnumerationProperty( CountingObjectType.PAPER_NUMBER )
    }, providedOptions ) as CountingCreatorNodeOptions;

    super();

    assert && assert( sumProperty.range, `Range is required: ${sumProperty.range}` );
    const maxSum = sumProperty.range!.max;

    this.screenView = screenView;

    const createSingleTargetNode = ( offset: Vector2 ): Node => {
      const targetNode = new Node();

      targetNode.addChild( new BaseNumberNode( new BaseNumber( 1, place ), 1, {
        includeHandles: false,
        playObjectTypeProperty: options.playObjectTypeProperty
      } ) );

      if ( options.playObjectTypeProperty.value === CountingObjectType.PAPER_NUMBER ) {
        targetNode.scale( 0.64, 0.55 );
      }
      else {
        targetNode.scale( 0.85 );
      }

      targetNode.translation = offset;
      return targetNode;
    };

    const numberValue = Math.pow( 10, place );

    // empirically determined stacking
    const backTargetNode = createSingleTargetNode( new Vector2( -9, -9 ) );
    const frontTargetNode = createSingleTargetNode( new Vector2( 0, 0 ) );

    this.targetNode = new Node( {
      cursor: 'pointer',
      children: [ backTargetNode, frontTargetNode ]
    } );
    this.targetNode.touchArea = this.targetNode.localBounds.dilatedX( 15 ).dilatedY( 5 );

    options.playObjectTypeProperty.lazyLink( playObjectType => {
      this.targetNode.children.forEach( targetNode => {
        targetNode.removeAllChildren();

        targetNode.addChild( new BaseNumberNode( new BaseNumber( 1, place ), 1, {
          includeHandles: false,
          playObjectTypeProperty: options.playObjectTypeProperty
        } ) );
      } );
    } );

    // We need to be disabled if adding this number would increase the sum past the maximum sum.
    new DerivedProperty( [ sumProperty ], sum => sum + numberValue <= maxSum ).linkAttribute( this.targetNode, 'visible' );

    // Don't show the one of the two parts of the target node if adding two numbers would increase the sum past the
    // maximum sum.
    new DerivedProperty( [ sumProperty ],
      sum => sum + numberValue + numberValue <= maxSum ).linkAttribute( backTargetNode, 'visible' );

    this.targetNode.addInputListener( {
      down: ( event: any ) => {
        if ( !event.canStartPress() ) { return; }

        // We want this relative to the screen view, so it is guaranteed to be the proper view coordinates.
        const viewPosition = screenView.globalToLocalPoint( event.pointer.point );
        const paperNumber = new PaperNumber( numberValue, new Vector2( 0, 0 ) );

        // Once we have the number's bounds, we set the position so that our pointer is in the middle of the drag target.
        paperNumber.setDestination( viewPosition.minus( paperNumber.getDragTargetOffset() ), false );

        // Create and start dragging the new paper number node
        screenView.addAndDragNumber( event, paperNumber );

        // TODO: the need for this guard means that the play areas are not in sync, and should be eliminated when https://github.com/phetsims/number-play/issues/6 is fixed.
        if ( options.updateCurrentNumber &&
             // @ts-ignore TODO-TS: Remove when above issue is fixed
             screenView.playArea.currentNumberProperty.value < screenView.playArea.currentNumberProperty.range.max ) {

          // a user grabbed a new number, so update the sim's currentNumberProperty
          // @ts-ignore
          screenView.playArea.isControllingCurrentNumber = true;
          // @ts-ignore
          screenView.playArea.currentNumberProperty.value++;
          // @ts-ignore
          screenView.playArea.isControllingCurrentNumber = false;
        }
      }
    } );

    this.addChild( this.targetNode );
  }

  /**
   * Return the view coordinates of the target.
   */
  public getOriginPosition(): Vector2 {

    // Trail to screenView, not including the screenView
    let trail = this.screenView.getUniqueLeafTrailTo( this.targetNode );
    trail = trail.slice( 1, trail.length );

    // Transformed to view coordinates
    return trail.localToGlobalPoint( this.targetNode.localBounds.center );
  }
}

countingCommon.register( 'CountingCreatorNode', CountingCreatorNode );
export default CountingCreatorNode;
