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
import GroupingLinkingType from '../model/GroupingLinkingType.js';
import Property from '../../../../axon/js/Property.js';

// types
type CountingCreatorNodeOptions = {
  updateCurrentNumber: boolean,
  playObjectTypeProperty: EnumerationProperty<CountingObjectType>
  groupingLinkingTypeProperty: EnumerationProperty<GroupingLinkingType>,
  groupedTargetScale: number,
  ungroupedTargetScale: number,
  backTargetOffset: Vector2
};

class CountingCreatorNode extends Node {
  private screenView: CountingCommonView;
  private readonly targetNode: Node;

  constructor( place: number, screenView: CountingCommonView, sumProperty: NumberProperty, providedOptions: Partial<CountingCreatorNodeOptions> ) {

    const options = merge( {
      updateCurrentNumber: false,
      playObjectTypeProperty: new EnumerationProperty( CountingObjectType.PAPER_NUMBER ),
      groupingLinkingTypeProperty: new EnumerationProperty( GroupingLinkingType.GROUPED ),
      groupedTargetScale: 0.65,
      ungroupedTargetScale: 1,
      backTargetOffset: new Vector2( -9, -9 )
    }, providedOptions ) as CountingCreatorNodeOptions;

    super();

    assert && assert( sumProperty.range, `Range is required: ${sumProperty.range}` );
    const maxSum = sumProperty.range!.max;

    this.screenView = screenView;

    const createSingleTargetNode = ( offset: Vector2 ): Node => {
      const targetNode = new Node();

      targetNode.addChild( this.createBaseNumberNode( place, options.playObjectTypeProperty, options.groupingLinkingTypeProperty ) );
      const scale = options.groupingLinkingTypeProperty.value === GroupingLinkingType.UNGROUPED ?
                    options.ungroupedTargetScale : options.groupedTargetScale;
      targetNode.scale( scale );

      targetNode.translation = offset;
      return targetNode;
    };

    const numberValue = Math.pow( 10, place );

    // empirically determined stacking
    const backTargetNode = createSingleTargetNode( options.backTargetOffset );
    const frontTargetNode = createSingleTargetNode( new Vector2( 0, 0 ) );

    this.targetNode = new Node( {
      cursor: 'pointer',
      children: [ backTargetNode, frontTargetNode ]
    } );
    this.targetNode.touchArea = this.targetNode.localBounds.dilatedX( 15 ).dilatedY( 5 );

    // TODO: Too much duplication (and memory leaks)?
    Property.lazyMultilink( [ options.playObjectTypeProperty, options.groupingLinkingTypeProperty ],
    ( playObjectType, groupingLinkingType ) => {
      this.targetNode.removeAllChildren();
      this.targetNode.addChild( createSingleTargetNode( options.backTargetOffset ) );
      this.targetNode.addChild( createSingleTargetNode( new Vector2( 0, 0 ) ) );
      new DerivedProperty( [ sumProperty ],
        sum => sum + numberValue + numberValue <= maxSum ).linkAttribute( this.targetNode.children[ 0 ], 'visible' );
    } );

    // We need to be disabled if adding this number would increase the sum past the maximum sum.
    new DerivedProperty( [ sumProperty ], sum => sum + numberValue <= maxSum ).linkAttribute( this.targetNode, 'visible' );

    // Don't show the one of the two parts of the target node if adding two numbers would increase the sum past the
    // maximum sum.
    new DerivedProperty( [ sumProperty ],
      sum => sum + numberValue + numberValue <= maxSum ).linkAttribute( this.targetNode.children[ 0 ], 'visible' );

    this.targetNode.addInputListener( {
      down: ( event: any ) => {
        if ( !event.canStartPress() ) { return; }

        // We want this relative to the screen view, so it is guaranteed to be the proper view coordinates.
        const viewPosition = screenView.globalToLocalPoint( event.pointer.point );
        const paperNumber = new PaperNumber( numberValue, new Vector2( 0, 0 ) );

        // Once we have the number's bounds, we set the position so that our pointer is in the middle of the drag target.
        paperNumber.setDestination( viewPosition.minus( paperNumber.getDragTargetOffset() ), false, 1 );

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
    return trail.localToGlobalPoint( this.targetNode.children[ 1 ].localBounds.center );
  }

  private createBaseNumberNode( place: number,
                                playObjectTypeProperty: EnumerationProperty<CountingObjectType>,
                                groupingLinkingTypeProperty: EnumerationProperty<GroupingLinkingType>
  ): BaseNumberNode {
    return new BaseNumberNode( new BaseNumber( 1, place ), 1, {
      includeHandles: false,
      playObjectTypeProperty: playObjectTypeProperty,
      isGroupable: groupingLinkingTypeProperty.value !== GroupingLinkingType.UNGROUPED
    } );
  }
}

countingCommon.register( 'CountingCreatorNode', CountingCreatorNode );
export default CountingCreatorNode;
