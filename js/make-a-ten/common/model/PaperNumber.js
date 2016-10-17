// Copyright 2015, University of Colorado Boulder

/**
 * Represents a number ranging from 1 to 1999. This is the model class that user
 * drags,splits and combines based on certain arithmetic rules.
 *
 * All these numbers are built from a set of few base numbers
 *
 * @author Sharfudeen Ashraf
 */
define( function( require ) {
  'use strict';

  // modules
  var makeATen = require( 'MAKE_A_TEN/makeATen' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Vector2 = require( 'DOT/Vector2' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var MakeATenSharedConstants = require( 'MAKE_A_TEN/make-a-ten/common/MakeATenSharedConstants' );
  var BaseNumber = require( 'MAKE_A_TEN/make-a-ten/common/model/BaseNumber' );

  // constants
  var TWO_DIGIT_OFFSET_DIMENSIONS = {
    0: new Vector2( 0, 0 ),
    1: new Vector2( 70, 4 )// how much a single digit image has to offset
  };

  // how much 2 digit and single digit must offset from parent
  var THREE_DIGIT_OFFSET_DIMENSIONS = {
    0: new Vector2( 0, 0 ),
    1: new Vector2( 55, 18 ),
    2: new Vector2( 125, 22 ) // the diff between 2 and 3 is same as diff between first and second in TWO_DIGIT
  };

  var FOUR_DIGIT_OFFSET_DIMENSIONS = {
    0: new Vector2( 0, 0 ),
    1: new Vector2( 65, 6 ),
    2: new Vector2( 120, 28 ),
    3: new Vector2( 190, 32 )
  };

  var SINGLE_DIGIT_OFFSET_DIMENSIONS = {
    0: new Vector2( 0, 0 )
  };

  var NUMBER_IMAGE_OFFSET_DIMENSIONS = {
    0: SINGLE_DIGIT_OFFSET_DIMENSIONS,
    1: TWO_DIGIT_OFFSET_DIMENSIONS,
    2: THREE_DIGIT_OFFSET_DIMENSIONS,
    3: FOUR_DIGIT_OFFSET_DIMENSIONS
  };

  //Used for tracking paperNumber Models
  // https://github.com/phetsims/make-a-ten/issues/199
  var PAPER_NUMBER_ID_GENERATOR = 1;

  /**
   *
   * @param {number} numberValue
   * @param {Vector2} initialPosition
   * @param {Object} options
   * @constructor
   */
  function PaperNumber( numberValue, initialPosition, options ) {
    var self = this;
    options = _.extend( { opacity: 1 }, options );

    this.id = PAPER_NUMBER_ID_GENERATOR++;

    PropertySet.call( this, {

      // number this paper model represents ex 324
      numberValue: numberValue,

      // Property that indicates where in model space the upper left corner of this shape is.  In general, this should
      // not be set directly outside of this type, and should only be manipulated through the methods defined below.
      position: initialPosition.copy(),

      // Flag that tracks whether the user is dragging this shape around.  Should be set externally, generally by the a
      // view node.
      userControlled: false,

      // Flag that indicates whether this element is animating from one location to another, should not be set externally.
      animating: false,

      //no of digits
      digitLength: 0,

      opacity: options.opacity

    } );

    // Destination is used for animation, and should be set through accessor methods only.
    this.destination = initialPosition.copy(); // @private


    // A number like 120 is composed of  to 2 number images in this simulation.
    // The baseNumber object represents the "parts"
    this.baseNumbers = [];

    this.animationVelocity = MakeATenSharedConstants.ANIMATION_VELOCITY;

    this.decomposeIntoBaseNumbers( this.numberValue );

    // Trigger an event whenever this shape returns to its original position.
    this.positionProperty.lazyLink( function( position ) {
      if ( position.equals( initialPosition ) ) {
        self.trigger( 'returnedToOrigin' );
      }
    } );

    this.numberValueProperty.link( function( newValue ) {
      self.digitLength = (newValue + '').length;
    } );

  }

  makeATen.register( 'PaperNumber', PaperNumber );

  return inherit( PropertySet, PaperNumber, {

    /**
     *
     * @param {number} dt
     */
    step: function( dt ) {
      if ( !this.userControlled ) {

        // perform any animation
        var distanceToDestination = this.position.distance( this.destination );
        if ( distanceToDestination > dt * this.animationVelocity ) {
          // Move a step toward the destination.
          var stepVector = this.destination.minus( this.position ).setMagnitude( this.animationVelocity * dt );
          this.position = this.position.plus( stepVector );

        }
        else if ( this.animating ) {
          // Less than one time step away, so just go to the destination.
          this.position = this.destination;
          this.animating = false;
        }

      }
    },

    /**
     * A number such as 238 will result in 200,30,8 as base numbers for which we have corresponding images
     *
     * @param {number} value
     */
    decomposeIntoBaseNumbers: function( value ) {
      this.baseNumbers = [];
      var numberOfSetDimensions = this.getOffsetArrayByDigits( value );
      var valueStr = value + '';
      var noOfDigits = valueStr.length;
      var opacityValue = 1;
      var numberPositionIndex = 0;

      for ( var i = 0; i < noOfDigits; i++ ) {
        var place = noOfDigits - i - 1;
        var digit = Math.floor( value / Math.pow( 10, place ) ) % 10;
        var baseNumberValue = digit * Math.pow( 10, place );
        if ( baseNumberValue === 0 ) {
          continue;
        }

        var offset = numberOfSetDimensions[ numberPositionIndex ];
        var baseNumber = new BaseNumber( baseNumberValue, offset.copy(), opacityValue );
        this.baseNumbers.push( baseNumber );

        //keep reducing the opacity for numbers placed on the top
        opacityValue = opacityValue - 0.03;
        numberPositionIndex++;
      }
    },

    canPullApart: function() {
      return (this.numberValue !== 1);
    },

    /**
     * returns the Dimensions of the Model (based on Image Size)
     * @returns {*}
     */
    getDimension: function() {
      return MakeATenSharedConstants.PAPER_NUMBER_DIMENSIONS[ this.digitLength ];
    },


    /**
     * Calculates at which point the split must happen
     *
     * @param newPulledNumber
     * @returns {Vector2}
     */
    getDigitOffsetPosition: function( newPulledNumber ) {
      var newPulledNumberLength = (newPulledNumber + '').length;
      var numberOfSetDimensions = NUMBER_IMAGE_OFFSET_DIMENSIONS[ this.digitLength - 1 ]; // digits-1 zero based index
      var digitDifference = this.digitLength - newPulledNumberLength;
      return numberOfSetDimensions[ digitDifference ];
    },

    /**
     * Based on the number of digits gives an array of offset position
     *
     * @param value
     * @returns {object}
     */
    getOffsetArrayByDigits: function( value ) {
      var digits = (value + '').length;
      var numberOfSetDimensions = _.clone( NUMBER_IMAGE_OFFSET_DIMENSIONS[ digits - 1 ] ); // digits-1 zero based index

      // handle numbers like 102 where there are only two base numbers and the second number is at third position
      if ( digits === 3 ) {
        var isBase2NumbersWithOffset = (value % 100 > 0) && (value % 100 < 10);
        if ( isBase2NumbersWithOffset ) {
          // the second number (index =1) is at third position For example in numbers like 107, the second
          // base number '7' is at third position, so assign the third positional value
          numberOfSetDimensions[ 1 ] = numberOfSetDimensions[ 2 ];
        }
      }

      if ( digits === 4 ) {

        //handle numbers like 1070
        var twoDigitOffset = (value % 1000 >= 10) && (value % 1000 < 100);
        if ( twoDigitOffset ) {
          numberOfSetDimensions[ 1 ] = numberOfSetDimensions[ 2 ];
          numberOfSetDimensions[ 2 ] = numberOfSetDimensions[ 3 ];
          return numberOfSetDimensions;
        }

        //handle numbers like 1007
        var singleDigitOffset = (value % 1000 < 10 );
        if ( singleDigitOffset ) {
          numberOfSetDimensions[ 1 ] = numberOfSetDimensions[ 3 ];
          return numberOfSetDimensions;
        }

        //handle number line 1107
        var intermediateOffset = (value % 1000 > 100 && value % 100 < 10);
        if ( intermediateOffset ) {
          numberOfSetDimensions[ 2 ] = numberOfSetDimensions[ 3 ];
          return numberOfSetDimensions;
        }

      }

      return numberOfSetDimensions;

    },


    /**
     *
     * @param newNumber
     */
    changeNumber: function( newNumber ) {
      newNumber = +newNumber;
      var oldDigitsLength = this.digitLength;
      this.decomposeIntoBaseNumbers( newNumber );
      this.numberValue = newNumber;
      var newDigitLength = this.digitLength;

      //Collapsed into a single Number, adjust the positions issue #21
      if ( newDigitLength - oldDigitsLength > 0 ) {
        var offsets = NUMBER_IMAGE_OFFSET_DIMENSIONS[ newDigitLength - 1 ];
        this.setDestination( this.position.plus( new Vector2( -offsets[ 1 ].x, -offsets[ 1 ].y ) ) );
      }

    },

    /**
     * @param {Vector2} destination
     * @param {boolean} animate
     * @param {number} [animationVelocity]
     */
    setDestination: function( destination, animate, animationVelocity ) {
      this.destination = destination;
      this.animationVelocity = ( animationVelocity !== undefined ) ? animationVelocity : MakeATenSharedConstants.ANIMATION_VELOCITY;

      if ( animate ) {
        this.animating = true;
      }
      else {
        this.position = destination;
      }
    },

    /**
     *
     * Make sure the paper number is within view Port
     * @param {Bounds2} viewBounds
     * @param {Vector2} position
     * @param {boolean} animate // (optional) indicates if the new constrained position should be directly set or animated
     */
    constrainPosition: function( viewBounds, newPosition, animate ) {
      var paperDimension = this.getDimension();
      var paperWidth = paperDimension.width;
      var paperHeight = paperDimension.height;
      var overAllBounds = Bounds2.rect( viewBounds.x - paperWidth / 2, viewBounds.y - paperHeight / 2,
        viewBounds.width, viewBounds.height - paperHeight / 2 );
      var newPos = overAllBounds.closestPointTo( newPosition );
      this.setDestination( newPos, animate );
    },

    /**
     * Return the shape to the place where it was originally created.
     * @param {boolean} animate
     * @param {number} [animationVelocity]
     */
    returnToOrigin: function( animate, animationVelocity ) {
      this.setDestination( this.positionProperty.initialValue, animate, animationVelocity );
    },

    /**
     * Based on the position (relative to the node, determine if the point is one the first digit
     * or  second digit or third digit
     *
     * Example: if the Number is 134  and user has clicked on 1, the positional index
     * would be 0 and it if is 3 the positional index would be 1 and if it is 4 the positional index would be 2
     *
     * @param {Vector2} position - position local to the node
     * @returns {number} - The positional index (This is used to calculate which number should be pulled out)
     */
    determineDigitIndex: function( position ) {
      if ( this.baseNumbers.length === 1 ) {
        return 0;
      }

      var basePositions = NUMBER_IMAGE_OFFSET_DIMENSIONS[ this.digitLength - 1 ];

      for ( var i = 0; i < basePositions.length - 1; i++ ) {
        if ( position.x >= basePositions[ i ].x && position.x <= basePositions[ i + 1 ].x ) {
          return i;
        }
      }
      return i;
    },

    resetOpacity: function() {
      this.opacityProperty.reset();
    }

  } );

} );
