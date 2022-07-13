// Copyright 2021-2022, University of Colorado Boulder

/**
 * Common ScreenView for CommonModel.
 *
 * @author Sharfudeen Ashraf
 */

import Property from '../../../../axon/js/Property.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import { Node, Plane, PressListenerEvent } from '../../../../scenery/js/imports.js';
import ClosestDragListener from '../../../../sun/js/ClosestDragListener.js';
import countingCommon from '../../countingCommon.js';
import CountingCommonConstants from '../CountingCommonConstants.js';
import ArithmeticRules from '../model/ArithmeticRules.js';
import PaperNumberNode from './PaperNumberNode.js';
import CountingCommonModel from '../model/CountingCommonModel.js';
import PaperNumber from '../model/PaperNumber.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Tandem from '../../../../tandem/js/Tandem.js';

// types
export type PaperNumberNodeMap = Record<number, PaperNumberNode>;

class CountingCommonView extends ScreenView {
  public model: CountingCommonModel;
  protected paperNumberLayerNode: Node;
  private readonly tryToCombineNumbersCallback: OmitThisParameter<( draggedPaperNumber: PaperNumber ) => void>;
  private readonly availableViewBoundsProperty: Property<Bounds2>;
  protected readonly resetAllButton: ResetAllButton;
  private readonly closestDragListener: ClosestDragListener;
  private readonly addAndDragNumberCallback: OmitThisParameter<( event: PressListenerEvent, paperNumber: PaperNumber ) => void>;
  private readonly paperNumberNodeMap: PaperNumberNodeMap;

  protected constructor( model: CountingCommonModel ) {
    super( {
      tandem: Tandem.OPT_OUT
    } );

    this.model = model;

    // Where all of the paper numbers are. NOTE: Subtypes need to add this as a child with the proper place in layering
    // (this common view doesn't do that).
    this.paperNumberLayerNode = new Node();

    this.tryToCombineNumbersCallback = this.tryToCombineNumbers.bind( this );
    this.addAndDragNumberCallback = this.addAndDragNumber.bind( this );

    // PaperNumber.id => {PaperNumberNode} - lookup map for efficiency
    this.paperNumberNodeMap = {};

    // The view coordinates where numbers can be dragged. Can update when the sim is resized.
    this.availableViewBoundsProperty = new Property( ScreenView.DEFAULT_LAYOUT_BOUNDS );

    // Handle touches nearby to the numbers, and interpret those as the proper drag.
    this.closestDragListener = new ClosestDragListener( 30, 0 );
    const backgroundDragTarget = new Plane();
    backgroundDragTarget.addInputListener( this.closestDragListener );
    this.addChild( backgroundDragTarget );

    // Persistent, no need to unlink
    this.availableViewBoundsProperty.lazyLink( ( availableViewBounds: Bounds2 ) => {
      model.paperNumbers.forEach( paperNumber => {
        paperNumber.setConstrainedDestination( availableViewBounds, paperNumber.positionProperty.value );
      } );
    } );

    this.resetAllButton = new ResetAllButton( {
      listener: () => {
        model.reset();
        this.reset();
      }
    } );
    this.addChild( this.resetAllButton );
  }

  /**
   * Used to work around super initialization order
   */
  public finishInitialization(): void {
    const paperNumberAddedListener = this.onPaperNumberAdded.bind( this );
    const paperNumberRemovedListener = this.onPaperNumberRemoved.bind( this );

    // Add nodes for every already-existing paper number
    this.model.paperNumbers.forEach( paperNumberAddedListener );

    // Add and remove nodes to match the model
    this.model.paperNumbers.addItemAddedListener( paperNumberAddedListener );
    this.model.paperNumbers.addItemRemovedListener( paperNumberRemovedListener );
  }

  /**
   * Add a paper number to the model and immediately start dragging it with the provided event.
   *
   * @param event - The Scenery event that triggered this.
   * @param paperNumber - The paper number to add and then drag
   */
  public addAndDragNumber( event: PressListenerEvent, paperNumber: PaperNumber ): void {
    // Add it and lookup the related node.
    this.model.addPaperNumber( paperNumber );

    const paperNumberNode = this.findPaperNumberNode( paperNumber );
    paperNumberNode.startSyntheticDrag( event );
  }

  /**
   * Creates and adds a PaperNumberNode.
   */
  public onPaperNumberAdded( paperNumber: PaperNumber ): PaperNumberNode {
    const paperNumberNode = new PaperNumberNode( paperNumber, this.availableViewBoundsProperty,
      this.addAndDragNumberCallback, this.tryToCombineNumbersCallback );

    this.paperNumberNodeMap[ paperNumberNode.paperNumber.id ] = paperNumberNode;
    this.paperNumberLayerNode.addChild( paperNumberNode );
    paperNumberNode.attachListeners();

    this.closestDragListener.addDraggableItem( paperNumberNode );

    return paperNumberNode;
  }

  /**
   * Handles removing the relevant PaperNumberNode
   */
  public onPaperNumberRemoved( paperNumber: PaperNumber ): void {
    const paperNumberNode = this.findPaperNumberNode( paperNumber );

    delete this.paperNumberNodeMap[ paperNumberNode.paperNumber.id ];
    this.closestDragListener.removeDraggableItem( paperNumberNode );
    paperNumberNode.dispose();
  }

  /**
   * Given a {PaperNumber}, find our current display ({PaperNumberNode}) of it.
   */
  public findPaperNumberNode( paperNumber: PaperNumber ): PaperNumberNode {
    const result = this.paperNumberNodeMap[ paperNumber.id ];
    assert && assert( result, 'Did not find matching Node' );
    return result;
  }

  /**
   * When the user drops a paper number they were dragging, see if it can combine with any other nearby paper numbers.
   */
  public tryToCombineNumbers( draggedPaperNumber: PaperNumber ): void {
    const draggedNode = this.findPaperNumberNode( draggedPaperNumber );
    const draggedNumberValue = draggedPaperNumber.numberValueProperty.value;
    const allPaperNumberNodes = this.paperNumberLayerNode.children;
    const droppedNodes = draggedNode.findAttachableNodes( allPaperNumberNodes as PaperNumberNode[] );

    // Check them in reverse order (the one on the top should get more priority)
    droppedNodes.reverse();

    for ( let i = 0; i < droppedNodes.length; i++ ) { // eslint-disable-line no-unreachable-loop
      const droppedNode = droppedNodes[ i ];
      const droppedPaperNumber = droppedNode.paperNumber;
      const droppedNumberValue = droppedPaperNumber.numberValueProperty.value;

      if ( ArithmeticRules.canAddNumbers( draggedNumberValue, droppedNumberValue ) ) {
        this.model.collapseNumberModels( this.availableViewBoundsProperty.value, draggedPaperNumber, droppedPaperNumber );
        return; // A bit weird, but no need to relayer or try combining with others?
      }
      else {
        // repel numbers - show rejection
        this.model.repelAway( this.availableViewBoundsProperty.value, draggedPaperNumber, droppedPaperNumber,
          ( leftPaperNumber: PaperNumber, rightPaperNumber: PaperNumber ) => {

            return {
              // @ts-ignore TODO-TS: Remove when CountingCommonConstants is converted to TS
              left: -CountingCommonConstants.MOVE_AWAY_DISTANCE[ leftPaperNumber.digitLength ],
              // @ts-ignore TODO-TS: Remove when CountingCommonConstants is converted to TS
              right: CountingCommonConstants.MOVE_AWAY_DISTANCE[ rightPaperNumber.digitLength ]
            };
          } );
        return; // A bit weird, but if repelled, no need to check for overlapping bits?
      }
    }

    // TODO: this should not be needed anymore because dropped paper numbers can no longer be overlapping without
    // combining from work in https://github.com/phetsims/number-play/issues/36
    // if the dragged number is  larger than the node below it (dropped node), reorder
    // them in a way to bring small number on the top. see issue #39
    for ( let i = 0; i < allPaperNumberNodes.length; i++ ) {
      if ( allPaperNumberNodes[ i ] === draggedNode ) {
        continue;
      }

      if ( allPaperNumberNodes[ i ].bounds.intersectsBounds( draggedNode.bounds ) ) {
        if ( draggedNode.bounds.width > allPaperNumberNodes[ i ].bounds.width ) {
          allPaperNumberNodes[ i ].moveToFront();
        }
      }
    }
  }

  /**
   * Meant for subtypes to override to do additional component layout. Can't override layout(), as it takes additional
   * parameters that we may not have access to.
   */
  protected layoutControls(): void {
    this.resetAllButton.right = this.visibleBoundsProperty.value.right - 10;
    this.resetAllButton.bottom = this.visibleBoundsProperty.value.bottom - 10;
  }

  /**
   * Some views may need to constrain the vertical room at the top (for dragging numbers) due to a status bar.
   * This should be overridden to return the value required.
   *
   * @returns - Amount in view coordinates to leave at the top of the screen
   */
  public getTopBoundsOffset(): number {
    return 0;
  }

  public override layout( bounds: Bounds2 ): void {
    super.layout( bounds );

    // Some views may need to make extra room for a status bar
    const top = this.visibleBoundsProperty.value.minY + this.getTopBoundsOffset();
    this.availableViewBoundsProperty.value = this.visibleBoundsProperty.value.withMinY( top );

    this.layoutControls();
  }

  /**
   * To reset the view, should be overridden
   */
  public reset(): void {
    // Meant to be overridden
  }
}

countingCommon.register( 'CountingCommonView', CountingCommonView );

export default CountingCommonView;