// Copyright 2015-2021, University of Colorado Boulder

/**
 * Base model for counting screens.
 *
 * @author Sharfudeen Ashraf
 */

import createObservableArray from '../../../../../axon/js/createObservableArray.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import countingCommon from '../../countingCommon.js';
import MakeATenConstants from '../MakeATenConstants.js';
import PaperNumber from './PaperNumber.js';

class CountingCommonModel {
  constructor() {
    // @public {ObservableArrayDef.<PaperNumber>} - Numbers in play that can be interacted with.
    this.paperNumbers = createObservableArray();
  }

  /**
   * Steps the model forward by a unit of time.
   * @public
   *
   * @param {number} dt
   */
  step( dt ) {
    // Cap large dt values, which can occur when the tab containing
    // the sim had been hidden and then re-shown
    dt = Math.min( 0.1, dt );

    for ( let i = 0; i < this.paperNumbers.length; i++ ) {
      this.paperNumbers.get( i ).step( dt );
    }
  }

  /**
   * Given two paper numbers, combine them (set one's value to the sum of their previous values, and remove the
   * other).
   * @public
   *
   * @param {Bounds2} availableModelBounds - Constrain the position to be inside these bounds
   * @param {PaperNumber} draggedPaperNumber
   * @param {PaperNumber} dropTargetNumber
   */
  collapseNumberModels( availableModelBounds, draggedPaperNumber, dropTargetNumber ) {
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
   * @public
   *
   * @param {PaperNumber} paperNumber
   */
  addPaperNumber( paperNumber ) {
    this.paperNumbers.push( paperNumber );
  }

  /**
   * Remove a PaperNumber from the model
   * @public
   *
   * @param {PaperNumber} paperNumber
   */
  removePaperNumber( paperNumber ) {
    this.paperNumbers.remove( paperNumber );
  }

  /**
   * Remove all PaperNumbers from the model.
   * @public
   *
   * @param {PaperNumber} paperNumber
   */
  removeAllPaperNumbers() {
    this.paperNumbers.clear();
  }

  /**
   * Given an array of integers, create and add paper numbers for each that are evenly distributed across the screen.
   * @public
   *
   * @param {Array.<number>} numbers
   */
  addMultipleNumbers( numbers ) {
    for ( let i = 0; i < numbers.length; i++ ) {
      const number = numbers[ i ];

      // Ingore 0s
      if ( !number ) { continue; }

      // evenly distribute across the screen
      const x = MakeATenConstants.LAYOUT_BOUNDS.width * ( 1 + i ) / ( numbers.length + 1 );
      const initialNumberPosition = new Vector2( x, MakeATenConstants.LAYOUT_BOUNDS.height / 2.5 );
      const paperNumber = new PaperNumber( number, initialNumberPosition );
      this.addPaperNumber( paperNumber );
    }
  }

  /**
   * @public
   *
   * @param {Bounds2} availableModelBounds - Constrain the position to be inside these bounds
   * @param {PaperNumber} paperNumber1
   * @param {PaperNumber} paperNumber2
   */
  repelAway( availableModelBounds, paperNumber1, paperNumber2 ) {
    // Determine which are 'left' and 'right'
    const isPaper1Left = paperNumber1.positionProperty.value.x < paperNumber2.positionProperty.value.x;
    const leftPaperNumber = isPaper1Left ? paperNumber1 : paperNumber2;
    const rightPaperNumber = isPaper1Left ? paperNumber2 : paperNumber1;

    // Determine offsets
    const repelLeftOffset = -MakeATenConstants.MOVE_AWAY_DISTANCE[ leftPaperNumber.digitLength ];
    const repelRightOffset = MakeATenConstants.MOVE_AWAY_DISTANCE[ rightPaperNumber.digitLength ];
    const leftPosition = leftPaperNumber.positionProperty.value.plusXY( repelLeftOffset, 0 );
    const rightPosition = rightPaperNumber.positionProperty.value.plusXY( repelRightOffset, 0 );

    // Kick off the animation to the destination
    const animateToDestination = true;
    leftPaperNumber.setConstrainedDestination( availableModelBounds, leftPosition, animateToDestination );
    rightPaperNumber.setConstrainedDestination( availableModelBounds, rightPosition, animateToDestination );
  }

  /**
   * Reset the model
   * @public
   */
  reset() {
    this.removeAllPaperNumbers();
  }
}

countingCommon.register( 'CountingCommonModel', CountingCommonModel );

export default CountingCommonModel;
