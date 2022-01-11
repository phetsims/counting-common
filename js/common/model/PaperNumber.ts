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

// Incremented for PaperNumber IDs
let nextPaperNumberId = 1;

class PaperNumber {
  public readonly id: number;
  public readonly numberValueProperty: NumberProperty;
  public readonly positionProperty: Vector2Property;
  public readonly userControlledProperty: BooleanProperty;
  private destination: Vector2;
  private animating: boolean;
  public baseNumbers: BaseNumber[];
  public readonly endDragEmitter: Emitter<any>;
  public readonly endAnimationEmitter: Emitter<any>;
  public alternateBounds: null | Bounds2;
  public viewHasIndependentModel: boolean;

  /**
   * @param numberValue - Numeric value, e.g. 123
   * @param initialPosition
   */
  constructor( numberValue: number, initialPosition: Vector2 ) {

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

    // Destination is used for animation, and should be set through accessor methods only.
    this.destination = initialPosition.copy();

    // Whether this element is animating from one position to another, do not set externally.
    this.animating = false;

    // Represents the non-zero place values in this number. 1034 will have three place values, 4, 30 and 1000, which
    // when summed will equal our number.
    this.baseNumbers = PaperNumber.getBaseNumbers( this.numberValueProperty.value );

    // Fires when the user stops dragging a paper number.
    this.endDragEmitter = new Emitter( { parameters: [ { valueType: PaperNumber } ] } );

    // Fires when the animation towards our destination ends (we hit our destination).
    this.endAnimationEmitter = new Emitter( { parameters: [ { valueType: PaperNumber } ] } );

    // TODO: these should probably be refactored, see https://github.com/phetsims/number-play/issues/19
    // alternate Bounds set by the view if needed for dragging
    this.alternateBounds = null;

    // also set later by the view
    this.viewHasIndependentModel = true;
  }

  /**
   * Animates the number towards its destination.
   *
   * @param dt - in seconds
   */
  public step( dt: number ): void {
    if ( !this.userControlledProperty.value ) {
      const currentPosition = this.positionProperty.value;
      assert && assert( currentPosition.isFinite() );
      assert && assert( this.destination.isFinite() );

      // perform any animation
      const distanceToDestination = currentPosition.distance( this.destination );
      if ( distanceToDestination > dt * CountingCommonConstants.ANIMATION_VELOCITY ) {
        // Move a step toward the destination.
        const stepVector = this.destination.minus( currentPosition ).setMagnitude( CountingCommonConstants.ANIMATION_VELOCITY * dt );
        assert && assert( stepVector.isFinite() );
        this.positionProperty.value = currentPosition.plus( stepVector );

      }
      else if ( this.animating ) {
        // Less than one time step away, so just go to the destination.
        this.positionProperty.value = this.destination;
        this.animating = false;
        this.endAnimationEmitter.emit( this );
      }
    }
  }

  /**
   * The number of digits in the number, including zeros, e.g. 1204 has 4 digits.
   */
  public get digitLength(): number {
    assert && assert( this.numberValueProperty.value > 0 );

    return CountingCommonUtils.digitsInNumber( this.numberValueProperty.value );
  }

  /**
   * Returns the bounds of the paper number relative to the paper number's origin.
   */
  public getLocalBounds(): Bounds2 {
    // TODO: this is a temporary band-aid for https://github.com/phetsims/number-play/issues/19
    // Use the largest base number unless this model is independent and uses objects in the view
    return this.viewHasIndependentModel && this.alternateBounds ? this.alternateBounds :
           this.baseNumbers[ this.baseNumbers.length - 1 ].bounds;
  }

  /**
   * Locate the boundary between the "move" input area and "split" input area, in the number's local bounds or provided
   * bounds.
   */
  public getBoundaryY(): number {
    const bounds = this.getLocalBounds();
    const moveToSplitRatio = CountingCommonConstants.SPLIT_BOUNDARY_HEIGHT_PROPORTION;
    return bounds.maxY * ( 1 - moveToSplitRatio ) + bounds.minY * moveToSplitRatio;
  }

  /**
   * Returns the ideal spot to "drag" a number from (near the center of its move target) relative to its origin.
   */
  public getDragTargetOffset(): Vector2 {
    const bounds = this.getLocalBounds();

    const ratio = CountingCommonConstants.SPLIT_BOUNDARY_HEIGHT_PROPORTION / 2;
    return new Vector2( bounds.centerX, bounds.minY * ratio + bounds.maxY * ( 1 - ratio ) );
  }

  /**
   * Changes the number that this paper number represents.
   */
  public changeNumber( numberValue: number ): void {
    this.baseNumbers = PaperNumber.getBaseNumbers( numberValue );
    this.numberValueProperty.value = numberValue;
  }

  /**
   * Sets the destination of the number. If animate is false, it also sets the position.
   *
   * @param destination
   * @param animate - Whether to animate. If true, it will slide towards the destination. If false, it will immediately
   *                  set the position to be the same as the destination.
   */
  public setDestination( destination: Vector2, animate: boolean ): void {
    assert && assert( destination.isFinite() );

    this.destination = destination;

    if ( animate ) {
      this.animating = true;
    }
    else {
      this.positionProperty.value = destination;
    }
  }

  /**
   * If our paper number is outside of the available view bounds, move in inside those bounds.
   *
   * @param viewBounds
   * @param newDestination
   * @param [animate] - Indicates if the new constrained position should be directly set or animated
   * @param [useAlternateBounds] - Indicates if the alternate bounds should
   */
  // TODO remove this when removing alternate bounds
  // eslint-disable-next-line default-param-last
  public setConstrainedDestination( viewBounds: Bounds2, newDestination: Vector2, animate: boolean = false, useAlternateBounds?: boolean ): void {

    // Determine how our number's origin can be placed in the bounds
    // @ts-ignore TODO-TS: Specified type wont be needed for localBounds once alternateBounds is removed
    const localBounds: Bounds2 = useAlternateBounds ? this.alternateBounds : this.getLocalBounds();
    const padding = 10;
    const originBounds = new Bounds2( viewBounds.left - localBounds.left,
      viewBounds.top - localBounds.top,
      viewBounds.right - localBounds.right,
      viewBounds.bottom - localBounds.bottom ).eroded( padding );
    this.setDestination( originBounds.closestPointTo( newDestination ), animate );
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
