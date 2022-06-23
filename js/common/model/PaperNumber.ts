// Copyright 2021-2022, University of Colorado Boulder

/**
 * Represents a number ranging from 1 to 9999, that the user can interact with. Contains multiple "base numbers"
 * for each non-zero digit.
 *
 * @author Sharfudeen Ashraf
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import countingCommon from '../../countingCommon.js';
import CountingCommonConstants from '../CountingCommonConstants.js';
import CountingCommonUtils from '../CountingCommonUtils.js';
import BaseNumber from './BaseNumber.js';
import Easing from '../../../../twixt/js/Easing.js';
import Animation from '../../../../twixt/js/Animation.js';
import Range from '../../../../dot/js/Range.js';
import IReadOnlyProperty from '../../../../axon/js/IReadOnlyProperty.js';
import optionize from '../../../../phet-core/js/optionize.js';

type PaperNumberOptions = {
  groupingEnabledProperty?: IReadOnlyProperty<boolean>;
}
type SetDestinationOptions = {
  targetScale?: number;
  targetHandleOpacity?: number;
}

// Incremented for PaperNumber IDs
let nextPaperNumberId = 1;

// constants
const ANIMATION_SPEED = 300; // in screen coordinates per second
const MAX_ANIMATION_TIME = 1; // in seconds
const MIN_ANIMATION_TIME = 0.2; // in seconds
const ANIMATION_TIME_RANGE = new Range( MIN_ANIMATION_TIME, MAX_ANIMATION_TIME );

class PaperNumber {
  public readonly id: number;
  public readonly numberValueProperty: NumberProperty;
  public readonly positionProperty: Vector2Property;
  public readonly userControlledProperty: BooleanProperty;
  private destination: Vector2;
  private animating: boolean;
  public baseNumbers: BaseNumber[];
  public readonly endDragEmitter: Emitter<[ PaperNumber ]>;
  public readonly endAnimationEmitter: Emitter<[ PaperNumber ]>;
  public readonly scaleProperty: NumberProperty;
  public readonly handleOpacityProperty: NumberProperty;
  public readonly includeInSumProperty: BooleanProperty;
  private animation: Animation | null;
  public readonly groupingEnabledProperty: IReadOnlyProperty<boolean>;
  public localBounds: Bounds2;
  public returnAnimationBounds: Bounds2;

  /**
   * @param numberValue - Numeric value, e.g. 123
   * @param initialPosition
   * @param [providedOptions]
   */
  public constructor( numberValue: number, initialPosition: Vector2, providedOptions?: PaperNumberOptions ) {

    const options = optionize<PaperNumberOptions, PaperNumberOptions>()( {
      groupingEnabledProperty: new BooleanProperty( true )
    }, providedOptions );

    // IDs required for map-like lookup, see https://github.com/phetsims/make-a-ten/issues/199
    this.id = nextPaperNumberId++;

    // The number that this model represents, e.g. 324
    this.numberValueProperty = new NumberProperty( numberValue );

    // Property that indicates where in model space the upper left corner of this shape is. In general, this should not
    // be set directly outside of this type, and should be manipulated through the methods defined below.
    this.positionProperty = new Vector2Property( initialPosition.copy() );

    // Flag that tracks whether the user is dragging this number around. Should be set externally, generally by the
    // view node.
    this.userControlledProperty = new BooleanProperty( false );

    // our scale, used for animations
    this.scaleProperty = new NumberProperty( 1 );

    // the opacity of the handle, if one exists. used for animations
    this.handleOpacityProperty = new NumberProperty( 1 );

    // whether grouping is enabled, which determines if this paper number is allowed to combine with others. groupable
    // objects also have a background, non-groupable objects do not.
    this.groupingEnabledProperty = options.groupingEnabledProperty;

    // whether the value of this paper number should be included in the sum of the model
    this.includeInSumProperty = new BooleanProperty( true );

    // Should be set through accessor methods only.
    this.destination = initialPosition.copy();

    // Whether this element is animating from one position to another, do not set externally.
    this.animating = false;

    // store any animations so we can check if one is still running
    this.animation = null;

    // Represents the non-zero place values in this number. 1034 will have three place values, 4, 30 and 1000, which
    // when summed will equal our number.
    this.baseNumbers = PaperNumber.getBaseNumbers( this.numberValueProperty.value );

    // Fires when the user stops dragging a paper number.
    this.endDragEmitter = new Emitter( { parameters: [ { valueType: PaperNumber } ] } );

    // Fires when the animation towards our destination ends (we hit our destination).
    this.endAnimationEmitter = new Emitter( { parameters: [ { valueType: PaperNumber } ] } );

    // local bounds, also set later by the view
    this.localBounds = this.baseNumbers[ this.baseNumbers.length - 1 ].bounds;

    // bounds that should be used when animating. updated when the view is created
    this.returnAnimationBounds = this.localBounds;
  }

  /**
   * The number of digits in the number, including zeros, e.g. 1204 has 4 digits.
   */
  public get digitLength(): number {
    assert && assert( this.numberValueProperty.value > 0 );

    return CountingCommonUtils.digitsInNumber( this.numberValueProperty.value );
  }

  /**
   * Getter for our animating state.
   */
  public get isAnimating() {
    return this.animating;
  }

  /**
   * Locate the boundary between the "move" input area and "split" input area, in the number's local bounds or provided
   * bounds.
   */
  public getBoundaryY(): number {
    const moveToSplitRatio = CountingCommonConstants.SPLIT_BOUNDARY_HEIGHT_PROPORTION;
    return this.localBounds.maxY * ( 1 - moveToSplitRatio ) + this.localBounds.minY * moveToSplitRatio;
  }

  /**
   * Returns the ideal spot to "drag" a number from (near the center of its move target) relative to its origin.
   */
  public getDragTargetOffset(): Vector2 {
    return this.localBounds.center.plusXY( 0, 0.15 * this.localBounds.height );
  }

  /**
   * Changes the number that this paper number represents.
   */
  public changeNumber( numberValue: number ): void {
    // TODO: assert that sumProperty is deferred
    this.baseNumbers = PaperNumber.getBaseNumbers( numberValue );
    this.numberValueProperty.value = numberValue;
  }

  /**
   * Sets the destination of the number. If animate is false, it also sets the position.
   *
   * @param destination
   * @param animate - Whether to animate. If true, it will slide towards the destination. If false, it will immediately
   *                  set the position to be the same as the destination.
   * @param [providedOptions]
   */
  public setDestination( destination: Vector2, animate: boolean, providedOptions?: SetDestinationOptions ): void {
    assert && assert( destination.isFinite() );

    const options = optionize<SetDestinationOptions>()( {
      targetScale: 1,
      targetHandleOpacity: 1
    }, providedOptions );

    if ( animate ) {
      this.animating = true;

      this.animation && this.animation.stop();
      const distance = this.positionProperty.value.distance( destination );

      // calculate the time needed to get to the destination
      const animationDuration = ANIMATION_TIME_RANGE.constrainValue( distance / ANIMATION_SPEED );

      this.animation = new Animation( {
        duration: animationDuration,
        targets: [ {
          property: this.positionProperty,
          to: destination,
          easing: Easing.QUADRATIC_IN_OUT
        }, {
          property: this.scaleProperty,
          to: options.targetScale,
          from: this.scaleProperty.value
        }, {
          property: this.handleOpacityProperty,
          to: options.targetHandleOpacity,
          from: this.handleOpacityProperty.value
        } ]
      } );

      this.animation.start();
      this.animation.finishEmitter.addListener( () => {
        this.animating = false;
        this.endAnimationEmitter.emit( this );
        this.animation = null;
      } );
    }
    else {
      this.positionProperty.value = destination;
      this.scaleProperty.value = options.targetScale;
    }
  }

  /**
   * If our paper number is outside of the available view bounds, move in inside those bounds.
   *
   * @param viewBounds
   * @param newDestination
   * @param [animate] - Indicates if the new constrained position should be directly set or animated
   */
  public setConstrainedDestination( viewBounds: Bounds2, newDestination: Vector2, animate = false ): void {
    const originBounds = this.getOriginBounds( viewBounds );
    this.setDestination( originBounds.closestPointTo( newDestination ), animate );
  }

  /**
   * Determine how our number's origin can be placed in the provided bounds.
   */
  public getOriginBounds( viewBounds: Bounds2 ): Bounds2 {
    return new Bounds2(
      viewBounds.left - this.localBounds.left,
      viewBounds.top - this.localBounds.top,
      viewBounds.right - this.localBounds.right,
      viewBounds.bottom - this.localBounds.bottom
    ).eroded( CountingCommonConstants.COUNTING_PLAY_AREA_MARGIN );
  }

  /**
   * Returns the lowest place number whose bounds include the position.
   *
   * @param position - Position relative to this number's origin.
   */
  public getBaseNumberAt( position: Vector2 ): BaseNumber {
    for ( let i = 0; i < this.baseNumbers.length; i++ ) {
      assert && assert( i === 0 || this.baseNumbers[ i ].place > this.baseNumbers[ i - 1 ].place,
        'Ensure that we start at lower places, required for this to work properly' );

      const baseNumber = this.baseNumbers[ i ];

      if ( baseNumber.bounds.containsPoint( position ) ) {
        return baseNumber;
      }
    }

    // Outside of the bounds, so we need to check each and determine the closest.
    for ( let i = 0; i < this.baseNumbers.length; i++ ) {
      const baseNumber = this.baseNumbers[ i ];
      if ( position.x > baseNumber.bounds.left ) {
        return baseNumber;
      }
    }

    // Default the largest one.
    return this.baseNumbers[ this.baseNumbers.length - 1 ];
  }

  /**
   * Given a number, returns an array of BaseNumbers that will represent the digit places.
   *
   * @param number - The number we want to break into digit places.
   */
  public static getBaseNumbers( number: number ): BaseNumber[] {
    assert && assert( number > 0 && number % 1 === 0 );

    const result = [];

    // Divide by 10 each loop, using the remainder and place index to create the place numbers.
    let remainder = number;
    let place = 0;
    while ( remainder ) {
      const digit = remainder % 10;
      if ( digit ) {
        result.push( new BaseNumber( digit, place ) );
      }

      remainder = ( remainder - digit ) / 10;
      place++;
    }

    return result;
  }
}

countingCommon.register( 'PaperNumber', PaperNumber );

export default PaperNumber;
