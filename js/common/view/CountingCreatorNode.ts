// Copyright 2021-2022, University of Colorado Boulder

/**
 * Node that can display a 1, 10, 100, or counting object which can be clicked/dragged to create draggable paper numbers or
 * counting objects. Factored out from ExplorePanel.js in make-a-ten, see https://github.com/phetsims/number-play/issues/19
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BaseNumber from '../../../../counting-common/js/common/model/BaseNumber.js';
import CountingObject from '../../../../counting-common/js/common/model/CountingObject.js';
import BaseNumberNode from '../../../../counting-common/js/common/view/BaseNumberNode.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Node, NodeOptions, PressListenerEvent } from '../../../../scenery/js/imports.js';
import countingCommon from '../../countingCommon.js';
import CountingCommonView from './CountingCommonView.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import CountingObjectType from '../model/CountingObjectType.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import optionize from '../../../../phet-core/js/optionize.js';
import Multilink from '../../../../axon/js/Multilink.js';
import TEmitter from '../../../../axon/js/TEmitter.js';

// types
type SelfOptions = {
  updateCurrentNumber?: boolean;
  countingObjectTypeProperty?: TReadOnlyProperty<CountingObjectType>;
  groupingEnabledProperty?: TReadOnlyProperty<boolean>;
  groupedTargetScale?: number;
  ungroupedTargetScale?: number;
  backTargetOffset?: Vector2;

  // pointer area dilation
  touchAreaXDilation?: number;
  touchAreaYDilation?: number;

  // pointer area shift
  touchAreaXShift?: number;
};
type CountingCreatorNodeOptions = SelfOptions & NodeOptions;

class CountingCreatorNode extends Node {
  private readonly creatorNumberValue: number;
  private screenView: CountingCommonView;
  private readonly targetNode: Node;
  private readonly sumProperty: NumberProperty;
  private readonly showFrontTargetNumber: number;
  private readonly showBackTargetNumber: number;
  private readonly backTargetOffset: Vector2;
  private backTargetNode: Node;
  private frontTargetNode: Node;

  // TODO: Improve organization and docs in this file
  public constructor( place: number, screenView: CountingCommonView, sumProperty: NumberProperty, resetEmitter: TEmitter,
                      providedOptions?: CountingCreatorNodeOptions ) {

    const options = optionize<CountingCreatorNodeOptions, SelfOptions, NodeOptions>()( {
      updateCurrentNumber: false,
      countingObjectTypeProperty: new EnumerationProperty( CountingObjectType.PAPER_NUMBER ),
      groupingEnabledProperty: new BooleanProperty( true ),
      groupedTargetScale: 0.65,
      ungroupedTargetScale: 1,
      backTargetOffset: new Vector2( -9, -9 ),

      touchAreaXDilation: 15,
      touchAreaYDilation: 5,
      touchAreaXShift: 0
    }, providedOptions );

    super( options );

    assert && assert( sumProperty.range, `Range is required: ${sumProperty.range}` );

    this.creatorNumberValue = Math.pow( 10, place );

    this.screenView = screenView;
    this.sumProperty = sumProperty;

    const maxSum = sumProperty.range.max;

    // TODO: The naming of these is not accurate
    this.showFrontTargetNumber = maxSum - this.creatorNumberValue; // 9
    this.showBackTargetNumber = this.showFrontTargetNumber - this.creatorNumberValue; // 8

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
    this.targetNode.touchArea = this.targetNode.localBounds.dilatedXY( options.touchAreaXDilation, options.touchAreaYDilation )
      .shiftedX( options.touchAreaXShift );

    // TODO: Too much duplication?
    Multilink.lazyMultilink( [ options.countingObjectTypeProperty, options.groupingEnabledProperty ],
      ( countingObjectType, groupingEnabled ) => {
        const backTargetNodeVisible = this.backTargetNode.visible;
        const frontTargetNodeVisible = this.frontTargetNode.visible;

        this.backTargetNode = createSingleTargetNode( options.backTargetOffset );
        this.frontTargetNode = createSingleTargetNode( new Vector2( 0, 0 ) );

        this.backTargetNode.visible = backTargetNodeVisible;
        this.frontTargetNode.visible = frontTargetNodeVisible;

        this.targetNode.children = [ this.backTargetNode, this.frontTargetNode ];
        this.targetNode.touchArea = this.targetNode.localBounds.dilatedXY( options.touchAreaXDilation, options.touchAreaYDilation )
          .shiftedX( options.touchAreaXShift );
        this.targetNode.inputEnabled = backTargetNodeVisible || frontTargetNodeVisible;
      } );

    const updateTargetVisibility = ( sum: number, oldSum: number ) => {
      // counting up
      if ( sum === oldSum + this.creatorNumberValue ) {
        if ( sum === this.showFrontTargetNumber ) {
          this.frontTargetNode.visible = false;
        }
        else if ( sum === maxSum ) {
          this.backTargetNode.visible = false;
          this.targetNode.inputEnabled = false;
        }
      }
    };

    sumProperty.lazyLink( updateTargetVisibility );

    this.targetNode.addInputListener( {
      down: ( event: PressListenerEvent ) => {
        if ( !event.canStartPress() ) { return; }

        // @ts-ignore
        // console.log( `about to drag one out in in ${screenView.playArea.name}` );

        // We want this relative to the screen view, so it is guaranteed to be the proper view coordinates.
        const viewPosition = screenView.globalToLocalPoint( event.pointer.point );
        const countingObject = new CountingObject( this.creatorNumberValue, new Vector2( 0, 0 ), {
          groupingEnabledProperty: options.groupingEnabledProperty
        } );

        // Once we have the number's bounds, we set the position so that our pointer is in the middle of the drag target.
        countingObject.setDestination( viewPosition.minus( countingObject.getDragTargetOffset() ), false );

        // Create and start dragging the new paper number node
        screenView.addAndDragNumber( event, countingObject );
      }
    } );

    this.addChild( this.targetNode );

    resetEmitter.addListener( () => {
      this.backTargetNode.visible = true;
      this.frontTargetNode.visible = true;
      this.targetNode.inputEnabled = true;
    } );
  }

  public checkTargetVisibility( returnedNumberValue: number ): void {
    for ( let i = 0; i < returnedNumberValue / this.creatorNumberValue; i++ ) {
      if ( !this.backTargetNode.visible && this.sumProperty.value <= this.showFrontTargetNumber ) {
        this.backTargetNode.visible = true;
        this.targetNode.inputEnabled = true;
      }
      else if ( !this.frontTargetNode.visible && this.sumProperty.value <= this.showBackTargetNumber ) {
        this.frontTargetNode.visible = true;
      }
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
                                countingObjectTypeProperty: TReadOnlyProperty<CountingObjectType>,
                                groupingEnabledProperty: TReadOnlyProperty<boolean>
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
