// Copyright 2021-2022, University of Colorado Boulder

/**
 * Node that can display a 1, 10, 100, or counting object which can be clicked/dragged to create draggable paper numbers or
 * counting objects. Factored out from ExplorePanel.js in make-a-ten, see https://github.com/phetsims/number-play/issues/19
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

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
import Property from '../../../../axon/js/Property.js';
import IReadOnlyProperty from '../../../../axon/js/IReadOnlyProperty.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';

// types
type CountingCreatorNodeOptions = {
  updateCurrentNumber: boolean,
  countingObjectTypeProperty: IReadOnlyProperty<CountingObjectType>
  groupingEnabledProperty: IReadOnlyProperty<boolean>,
  groupedTargetScale: number,
  ungroupedTargetScale: number,
  backTargetOffset: Vector2
};

class CountingCreatorNode extends Node {
  private screenView: CountingCommonView;
  private readonly targetNode: Node;
  private readonly sumProperty: NumberProperty;
  private readonly showFrontTargetNumber: number;
  private readonly showBackTargetNumber: number;
  private readonly backTargetOffset: Vector2;
  private backTargetNode: Node;
  private frontTargetNode: Node;

  // TODO: Improve organization and docs in this file
  constructor( place: number, screenView: CountingCommonView, sumProperty: NumberProperty, providedOptions: Partial<CountingCreatorNodeOptions> ) {

    const options = merge( {
      updateCurrentNumber: false,
      countingObjectTypeProperty: new EnumerationProperty( CountingObjectType.PAPER_NUMBER ),
      groupingEnabledProperty: new BooleanProperty( true ),
      groupedTargetScale: 0.65,
      ungroupedTargetScale: 1,
      backTargetOffset: new Vector2( -9, -9 )
    }, providedOptions ) as CountingCreatorNodeOptions;

    super();

    assert && assert( sumProperty.range, `Range is required: ${sumProperty.range}` );

    const numberValue = Math.pow( 10, place );

    this.screenView = screenView;
    this.sumProperty = sumProperty;

    const maxSum = sumProperty.range!.max;
    this.showFrontTargetNumber = maxSum - numberValue;
    this.showBackTargetNumber = this.showFrontTargetNumber - numberValue;

    this.backTargetOffset = options.backTargetOffset;

    const createSingleTargetNode = ( offset: Vector2 ): Node => {
      const targetNode = new Node();

      targetNode.addChild( this.createBaseNumberNode( place, options.countingObjectTypeProperty, options.groupingEnabledProperty ) );
      const scale = options.groupingEnabledProperty.value ? options.groupedTargetScale : options.ungroupedTargetScale;
      targetNode.scale( scale );

      targetNode.translation = offset;
      return targetNode;
    };

    this.backTargetNode = createSingleTargetNode( options.backTargetOffset );
    this.frontTargetNode = createSingleTargetNode( new Vector2( 0, 0 ) );

    this.targetNode = new Node( {
      cursor: 'pointer',
      children: [ this.backTargetNode, this.frontTargetNode ]
    } );
    this.targetNode.touchArea = this.targetNode.localBounds.dilatedX( 15 ).dilatedY( 5 );

    // TODO: Too much duplication?
    Property.lazyMultilink( [ options.countingObjectTypeProperty, options.groupingEnabledProperty ],
      ( countingObjectType, groupingEnabled ) => {
        const backTargetNodeVisibile = this.backTargetNode.visible;
        const frontTargetNodeVisibile = this.frontTargetNode.visible;

        this.backTargetNode = createSingleTargetNode( options.backTargetOffset );
        this.frontTargetNode = createSingleTargetNode( new Vector2( 0, 0 ) );

        this.backTargetNode.visible = backTargetNodeVisibile;
        this.frontTargetNode.visible = frontTargetNodeVisibile;

        this.targetNode.children = [ this.backTargetNode, this.frontTargetNode ];
      } );

    const updateTargetVisibility = ( sum: number, oldSum: number ) => {
      // counting up
      if ( sum === oldSum + numberValue ) {
        if ( sum === this.showFrontTargetNumber ) {
          this.frontTargetNode.visible = false;
        }
        else if ( sum === maxSum ) {
          this.backTargetNode.visible = false;
        }
      }
    };

    sumProperty.lazyLink( updateTargetVisibility );

    this.targetNode.addInputListener( {
      down: ( event: any ) => {
        if ( !event.canStartPress() ) { return; }

        // We want this relative to the screen view, so it is guaranteed to be the proper view coordinates.
        const viewPosition = screenView.globalToLocalPoint( event.pointer.point );
        const paperNumber = new PaperNumber( numberValue, new Vector2( 0, 0 ), {
          groupingEnabledProperty: options.groupingEnabledProperty
        } );

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

  // TODO: Add support for returning numbers that had a higher value than one
  checkTargetVisibility(): void {
    if ( !this.backTargetNode.visible && this.sumProperty.value <= this.showFrontTargetNumber ) {
      this.backTargetNode.visible = true;
    }
    else if ( !this.frontTargetNode.visible && this.sumProperty.value <= this.showBackTargetNumber ) {
      this.frontTargetNode.visible = true;
    }
  }

  /**
   * Return the view coordinates of the target.
   */
  public getOriginPosition(): Vector2 {

    // Trail to screenView, not including the screenView
    let trail = this.screenView.getUniqueLeafTrailTo( this.targetNode );
    trail = trail.slice( 1, trail.length );

    // Transformed to view coordinates
    let origin = this.frontTargetNode.localBounds.center.plus( this.backTargetOffset );
    if ( this.sumProperty.value <= this.showBackTargetNumber ) {
      origin = this.frontTargetNode.localBounds.center;
    }

    // Transformed to view coordinates
    return trail.localToGlobalPoint( origin );
  }

  private createBaseNumberNode( place: number,
                                countingObjectTypeProperty: IReadOnlyProperty<CountingObjectType>,
                                groupingEnabledProperty: IReadOnlyProperty<boolean>
  ): BaseNumberNode {
    return new BaseNumberNode( new BaseNumber( 1, place ), 1, {
      includeHandles: false,
      countingObjectType: countingObjectTypeProperty.value,
      groupingEnabled: groupingEnabledProperty.value
    } );
  }
}

countingCommon.register( 'CountingCreatorNode', CountingCreatorNode );
export default CountingCreatorNode;
