// Copyright 2021-2022, University of Colorado Boulder

/**
 * Base model for counting screens.
 *
 * @author Sharfudeen Ashraf
 */

import createObservableArray, { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import countingCommon from '../../countingCommon.js';
import PaperNumber from './PaperNumber.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import IEmitter from '../../../../axon/js/IEmitter.js';

class CountingCommonModel {

  // Numbers in play that can be interacted with.
  public paperNumbers: ObservableArray<PaperNumber>;

  // the sum of all paper numbers
  public sumProperty: NumberProperty;

  // used to notify view sub-components that reset is being called
  public readonly resetEmitter: IEmitter;
  public readonly name: string;

  protected constructor( highestCount: number, name: string ) {
    this.paperNumbers = createObservableArray();
    this.sumProperty = new NumberProperty( 0, {
      range: new Range( 0, highestCount )
    } );
    this.resetEmitter = new Emitter();

    // TODO: Remove when done logging
    this.name = name;
  }

  /**
   * Given two paper numbers, combine them (set one's value to the sum of their previous values, and remove the
   * other).
   *
   * @param availableModelBounds - Constrain the position to be inside these bounds
   * @param draggedPaperNumber
   * @param dropTargetNumber
   */
  public collapseNumberModels( availableModelBounds: Bounds2, draggedPaperNumber: PaperNumber, dropTargetNumber: PaperNumber ): void {
    const dropTargetNumberValue = dropTargetNumber.numberValueProperty.value;
    const draggedNumberValue = draggedPaperNumber.numberValueProperty.value;
    const newValue = dropTargetNumberValue + draggedNumberValue;

    let numberToRemove;
    let numberToChange;

    // See https://github.com/phetsims/make-a-ten/issues/260
    if ( draggedPaperNumber.digitLength === dropTargetNumber.digitLength ) {
      numberToRemove = draggedPaperNumber;
      numberToChange = dropTargetNumber;
    }
    else {
      // The larger number gets changed, the smaller one gets removed.
      const droppingOnLarger = dropTargetNumberValue > draggedNumberValue;
      numberToRemove = droppingOnLarger ? draggedPaperNumber : dropTargetNumber;
      numberToChange = droppingOnLarger ? dropTargetNumber : draggedPaperNumber;
    }

    // Apply changes
    this.removePaperNumber( numberToRemove );
    numberToChange.changeNumber( newValue );

    numberToChange.setConstrainedDestination( availableModelBounds, numberToChange.positionProperty.value, false );
  }

  /**
   * Add a PaperNumber to the model
   */
  public addPaperNumber( paperNumber: PaperNumber ): void {
    this.paperNumbers.push( paperNumber );
  }

  /**
   * Remove a PaperNumber from the model
   */
  public removePaperNumber( paperNumber: PaperNumber ): void {
    this.paperNumbers.remove( paperNumber );
  }

  /**
   * Remove all PaperNumbers from the model.
   */
  public removeAllPaperNumbers(): void {
    this.paperNumbers.clear();
  }

  /**
   * Given an array of integers, create and add paper numbers for each that are evenly distributed across the screen.
   */
  public addMultipleNumbers( numbers: number[] ): void {
    for ( let i = 0; i < numbers.length; i++ ) {
      const number = numbers[ i ];

      // Ingore 0s
      if ( !number ) { continue; }

      // evenly distribute across the screen
      const x = ScreenView.DEFAULT_LAYOUT_BOUNDS.width * ( 1 + i ) / ( numbers.length + 1 );
      const initialNumberPosition = new Vector2( x, ScreenView.DEFAULT_LAYOUT_BOUNDS.height / 2.5 );
      const paperNumber = new PaperNumber( number, initialNumberPosition );
      this.addPaperNumber( paperNumber );
    }
  }

  /**
   * @param availableModelBounds - Constrain the position to be inside these bounds
   * @param paperNumber1
   * @param paperNumber2
   * @param getRepelOffsets
   */
  public repelAway( availableModelBounds: Bounds2, paperNumber1: PaperNumber, paperNumber2: PaperNumber,
                    getRepelOffsets: ( leftPaperNumber: PaperNumber, rightPaperNumber: PaperNumber ) => { left: number; right: number } ): void {
    // Determine which are 'left' and 'right'
    const isPaper1Left = paperNumber1.positionProperty.value.x < paperNumber2.positionProperty.value.x;
    const leftPaperNumber = isPaper1Left ? paperNumber1 : paperNumber2;
    const rightPaperNumber = isPaper1Left ? paperNumber2 : paperNumber1;

    // Determine offsets
    const repelOffsets = getRepelOffsets( leftPaperNumber, rightPaperNumber );
    const repelLeftOffset = repelOffsets.left;
    const repelRightOffset = repelOffsets.right;
    const leftPosition = leftPaperNumber.positionProperty.value.plusXY( repelLeftOffset, 0 );
    const rightPosition = rightPaperNumber.positionProperty.value.plusXY( repelRightOffset, 0 );

    // Kick off the animation to the destination
    const animateToDestination = true;
    leftPaperNumber.setConstrainedDestination( availableModelBounds, leftPosition, animateToDestination );
    rightPaperNumber.setConstrainedDestination( availableModelBounds, rightPosition, animateToDestination );
  }

  /**
   * Updates the total sum of the paper numbers.
   */
  public calculateTotal(): void {
    let total = 0;
    this.paperNumbers.filter( paperNumber => paperNumber.includeInSumProperty.value ).forEach( paperNumber => {
      total += paperNumber.numberValueProperty.value;
    } );
    console.log( 'calculating and setting total in ' + this.name + ': ' + total );
    this.sumProperty.value = total;
  }

  /**
   * Reset the model
   */
  public reset(): void {
    this.removeAllPaperNumbers();
    this.calculateTotal();
    this.resetEmitter.emit();
  }
}

countingCommon.register( 'CountingCommonModel', CountingCommonModel );

export default CountingCommonModel;
