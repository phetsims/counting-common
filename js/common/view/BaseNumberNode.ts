// Copyright 2021-2022, University of Colorado Boulder

/**
 * Creates image views for base numbers.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import { Circle, Image, Mipmap, Node, Path } from '../../../../scenery/js/imports.js';
import digit0_png from '../../../mipmaps/digit0_png.js';
import digit1_png from '../../../mipmaps/digit1_png.js';
import digit2_png from '../../../mipmaps/digit2_png.js';
import digit3_png from '../../../mipmaps/digit3_png.js';
import digit4_png from '../../../mipmaps/digit4_png.js';
import digit5_png from '../../../mipmaps/digit5_png.js';
import digit6_png from '../../../mipmaps/digit6_png.js';
import digit7_png from '../../../mipmaps/digit7_png.js';
import digit8_png from '../../../mipmaps/digit8_png.js';
import digit9_png from '../../../mipmaps/digit9_png.js';
import paperBackground1000_png from '../../../mipmaps/paperBackground1000_png.js';
import paperBackground100_png from '../../../mipmaps/paperBackground100_png.js';
import paperBackground10_png from '../../../mipmaps/paperBackground10_png.js';
import paperBackground1_png from '../../../mipmaps/paperBackground1_png.js';
import countingCommon from '../../countingCommon.js';
import BaseNumber from '../model/BaseNumber.js';
import groupBackground1_png from '../../../mipmaps/groupBackground1_png.js';
import CountingObjectType from '../model/CountingObjectType.js';
import groupBackground10_png from '../../../mipmaps/groupBackground10_png.js';
import CountingCommonConstants from '../CountingCommonConstants.js';
import optionize from '../../../../phet-core/js/optionize.js';

// types
type ImageMap = Record<number, Mipmap>;
type NumberMap = Record<number, number>;
type ZeroOffset = Record<number, number[]>;
type SelfOptions = {
  countingObjectType?: CountingObjectType;
  groupingEnabled?: boolean;
  includeHandles?: boolean;
  handleOffsetY?: number;
  isLargestBaseNumber?: boolean;
  hasDescendant?: boolean;
  isPartOfStack?: boolean;
};
export type BaseNumberNodeOptions = SelfOptions;

// place => mipmap info
const BACKGROUND_IMAGE_MAP = new Map();
CountingObjectType.enumeration.values.forEach( countingObjectType => {
  if ( countingObjectType === CountingObjectType.PAPER_NUMBER ) {
    BACKGROUND_IMAGE_MAP.set( countingObjectType, {
      0: paperBackground1_png,
      1: paperBackground10_png,
      2: paperBackground100_png,
      3: paperBackground1000_png
    } );
  }
  else {
    BACKGROUND_IMAGE_MAP.set( countingObjectType, {
      0: groupBackground1_png,
      1: groupBackground10_png
    } );
  }
} );

// digit => mipmap info
const DIGIT_IMAGE_MAP: ImageMap = {
  1: digit1_png,
  2: digit2_png,
  3: digit3_png,
  4: digit4_png,
  5: digit5_png,
  6: digit6_png,
  7: digit7_png,
  8: digit8_png,
  9: digit9_png
};

// place => x/y offsets for the first digit in each place
const PLACE_OFFSET_X: NumberMap = { 0: 13.44, 1: 13.02, 2: 14.7, 3: 19.74 };
const PLACE_OFFSET_Y: NumberMap = { 0: 7.98, 1: 12.39, 2: 16.8, 3: 21.42 };

// place => x/y offsets for the handle in each place
const PLACE_HANDLE_OFFSET_X: NumberMap = { 0: 27.3, 1: 29.82, 2: 31.71, 3: 35.91 };
const PLACE_HANDLE_OFFSET_Y: NumberMap = { 0: 19.95, 1: 15.54, 2: 11.13, 3: 6.51 };

// digit => horizontal offset for that digit (applied to all places, includes digit-specific information)
const DIGIT_OFFSET_X: NumberMap = {
  1: 16,
  2: -1.47,
  3: -1.47,
  4: -1.89,
  5: -3.78,
  6: -1.05,
  7: -5.04,
  8: -0.42,
  9: -2.1
};

// digit => horizontal offset, customized for each single digit base number
const FIRST_PLACE_DIGIT_OFFSET_X: NumberMap = { 1: -12.81, 2: 0, 3: 0, 4: 0, 5: 1.05, 6: 0, 7: 3.15, 8: 2.1, 9: 3.15 };

// place => horizontal positions of the zeros in the base number
const ZERO_OFFSET: ZeroOffset = {
  0: [],
  1: [ 57.12 ],
  2: [ 111.3, 59.64 ],
  3: [ 173.25, 121.8, 70.35 ]
};

// distance that the handle stem should overlap with a paper number (since they don't have a clean edge, we want enough
// extra length to make sure there is no gap between the paper number background and the stem)
const PAPER_NUMBER_HANDLE_OVERLAP_Y = 2;

// distance that the handle stem should overlap with a counting object card.
// TODO: should be 0 but not quite working, get cleaner-edged images from AM, see https://github.com/phetsims/counting-common/issues/12
const PLAY_OBJECT_HANDLE_OVERLAP_Y = 0.4;

const IMAGE_SCALE = 0.21;

class BaseNumberNode extends Node {


  /**
   * Maps place (0-3) to a {Dimension2} with the width/height
   */
  public static readonly PAPER_NUMBER_DIMENSIONS = _.mapValues( BACKGROUND_IMAGE_MAP.get( CountingObjectType.PAPER_NUMBER ),
    mipmap => new Dimension2( mipmap[ 0 ].width * IMAGE_SCALE, mipmap[ 0 ].height * IMAGE_SCALE ) );

  /**
   * Maps place (0-3) to a {Vector2} that is the offset of the upper-left corner of the BaseNumberNode relative to a
   * 1-digit BaseNumberNode.
   */
  public static readonly IMAGE_OFFSETS = [
    new Vector2( -21, 0 ),
    new Vector2( -70, -( PLACE_OFFSET_Y[ 1 ] - PLACE_OFFSET_Y[ 0 ] ) ),
    new Vector2( -70 - ( ZERO_OFFSET[ 2 ][ 0 ] - ZERO_OFFSET[ 1 ][ 0 ] ), -( PLACE_OFFSET_Y[ 2 ] - PLACE_OFFSET_Y[ 0 ] ) ),
    new Vector2( -70 - ( ZERO_OFFSET[ 3 ][ 0 ] - ZERO_OFFSET[ 1 ][ 0 ] ), -( PLACE_OFFSET_Y[ 3 ] - PLACE_OFFSET_Y[ 0 ] ) )
  ];

  public readonly handleNode: Node | undefined;
  public readonly backgroundNode: Image | null = null;

  public constructor( baseNumber: BaseNumber, opacity: number, providedOptions?: BaseNumberNodeOptions ) {
    super();

    const options = optionize<BaseNumberNodeOptions, SelfOptions>()( {
      countingObjectType: CountingObjectType.PAPER_NUMBER,
      includeHandles: false,
      handleOffsetY: 0,
      groupingEnabled: true,

      // TODO: docs? see https://github.com/phetsims/counting-common/issues/12
      isLargestBaseNumber: true,
      hasDescendant: false,
      isPartOfStack: false
    }, providedOptions );

    let groupingEnabled = options.groupingEnabled;
    if ( providedOptions === undefined || providedOptions?.groupingEnabled === undefined ) {
      groupingEnabled = options.countingObjectType === CountingObjectType.PAPER_NUMBER;
    }

    const isCountingObject = options.countingObjectType === CountingObjectType.PAPER_NUMBER;

    assert && !groupingEnabled && assert( options.countingObjectType !== CountingObjectType.PAPER_NUMBER,
      'Paper numbers are not allowed to turn off grouping.' );

    // Translate everything by our offset
    this.translation = baseNumber.offset;

    // The paper behind the numbers
    const backgroundNode = new Image( BACKGROUND_IMAGE_MAP.get( options.countingObjectType )[ baseNumber.place ], {
      imageOpacity: opacity,
      scale: IMAGE_SCALE
    } );

    // TODO: needs better logic and or docs in this section, see https://github.com/phetsims/counting-common/issues/12
    // aside from checking the option includeHandles, don't include a handle if this base number is a standalone 1, or
    // if removing the largest base number in this paper number would separate itself from its descendants (as opposed
    // to just removing one part of the largest base number). for example, with the paper number 1200, the 1 should not
    // get a handle because grabbing it would pull 1000 away from 200, and this can be accomplished by pulling the 200
    // off instead. in the case of 2200, the first 2 should get a handle because grabbing it would pull off one 1000.
    if ( options.includeHandles && !( baseNumber.numberValue === 1 && !options.isPartOfStack )
         && !( options.isLargestBaseNumber && baseNumber.digit === 1 && options.hasDescendant ) ) {

      const lineWidth = 1.24;
      const handleOverlapLength = isCountingObject ? PAPER_NUMBER_HANDLE_OVERLAP_Y : PLAY_OBJECT_HANDLE_OVERLAP_Y;
      const handleOverlapCompensation = PAPER_NUMBER_HANDLE_OVERLAP_Y - handleOverlapLength;
      const handleOffsetY = PLACE_HANDLE_OFFSET_Y[ baseNumber.place ] + options.handleOffsetY - handleOverlapCompensation;

      // The handle that attaches to the paper
      const handleStemShape = new Shape().moveTo( 0, 0 ).lineTo( 0, handleOffsetY );

      this.handleNode = new Node();
      this.addChild( this.handleNode );

      const handleStemNode = new Path( handleStemShape, {
        stroke: 'black',
        lineWidth: lineWidth
      } );
      handleStemNode.centerX = options.hasDescendant ? PLACE_HANDLE_OFFSET_X[ baseNumber.place ] : backgroundNode.centerX;
      handleStemNode.bottom = backgroundNode.top + handleOverlapLength;
      this.handleNode.addChild( handleStemNode );

      let handleCircle;
      const outerCircleRadius = 4.6;

      if ( options.isLargestBaseNumber ) {
        handleCircle = new Circle( outerCircleRadius, {
          fill: 'white',
          stroke: 'black',
          lineWidth: lineWidth
        } );
        handleCircle.addChild( new Circle( 2.1, {
          fill: 'black'
        } ) );
      }
      else {
        handleCircle = new Circle( outerCircleRadius, {
          fill: 'black'
        } );
      }
      handleCircle.centerX = handleStemNode.centerX;
      handleCircle.bottom = handleStemNode.top;
      this.handleNode.addChild( handleCircle );
    }

    // add the background paper on top of the handle
    if ( groupingEnabled ) {
      this.addChild( backgroundNode );
      this.backgroundNode = backgroundNode;
    }

    // add a number to the background if our type is paper number
    if ( isCountingObject ) {

      // Position of the initial digit
      let x = PLACE_OFFSET_X[ baseNumber.place ] + DIGIT_OFFSET_X[ baseNumber.digit ];
      const y = PLACE_OFFSET_Y[ baseNumber.place ];

      // We need to slightly offset some
      if ( baseNumber.place === 0 ) {
        x += FIRST_PLACE_DIGIT_OFFSET_X[ baseNumber.digit ];
      }

      // The initial (non-zero) digit
      this.addChild( new Image( DIGIT_IMAGE_MAP[ baseNumber.digit ], {
        x: x,
        y: y,
        scale: IMAGE_SCALE
      } ) );

      // Add the zeros
      const digitZeroOffsets = ZERO_OFFSET[ baseNumber.place ];
      for ( let i = 0; i < digitZeroOffsets.length; i++ ) {
        this.addChild( new Image( digit0_png, {
          x: digitZeroOffsets[ i ],
          y: y,
          scale: IMAGE_SCALE
        } ) );
      }
    }
    else {

      const ONE = 1;
      const value = baseNumber.numberValue;

      // TODO: temporary way to organize objects, needs work, see https://github.com/phetsims/counting-common/issues/12
      const numberOfRows = value === ONE && !options.isPartOfStack ? 1 : 5;
      const numberOfColumns = value === ONE && !options.isPartOfStack ? 1 : 2;
      const objectScale = value === ONE && !options.isPartOfStack ? 1 : 0.3;
      const numberOfSets = value === 20 ? 2 : 1;

      const fullObjectWidth = CountingCommonConstants.PLAY_OBJECT_SIZE.width;
      const fullObjectHeight = CountingCommonConstants.PLAY_OBJECT_SIZE.height;
      const renderedObjectWidth = fullObjectWidth * objectScale;
      const renderedObjectHeight = fullObjectHeight * objectScale;
      const singleCardBounds = CountingCommonConstants.SINGLE_COUNTING_OBJECT_BOUNDS;

      const xMargin = ( singleCardBounds.width - fullObjectWidth ) * 0.5;
      const yMargin = ( singleCardBounds.height - numberOfRows * renderedObjectHeight ) / ( numberOfRows + 1 );
      const yExtraMarginTop = backgroundNode.height - yMargin * ( numberOfRows + 1 ) - renderedObjectHeight * numberOfRows;

      // add and position the object images
      const objectImages: Image[] = [];
      for ( let z = 0; z < numberOfSets; z++ ) {
        for ( let i = 0; i < numberOfRows; i++ ) {
          for ( let j = 0; j < numberOfColumns; j++ ) {

            const width = singleCardBounds.width;
            const height = singleCardBounds.height;

            const columnWidth = ( width - ( ( numberOfColumns + 1 ) * xMargin ) ) / numberOfColumns;
            const centerX = ( ( j + 1 ) * xMargin ) + ( j * columnWidth ) + ( columnWidth / 2 ) +
                            // used to draw a second set for a double card exactly where the objects are when stacked
                            // from a single card on a double
                            z * ( backgroundNode.width - singleCardBounds.width + 0.1 );

            const rowHeight = ( height - ( ( numberOfRows + 1 ) * yMargin ) ) / numberOfRows;
            const centerY = ( ( i + 1 ) * yMargin ) + ( i * rowHeight ) + ( rowHeight / 2 ) + yExtraMarginTop;

            if ( objectImages.length < value ) {
              const objectImage = new Image( CountingCommonConstants.COUNTING_OBJECT_TYPE_TO_IMAGE.get( options.countingObjectType ), {
                maxWidth: renderedObjectWidth,
                maxHeight: renderedObjectHeight,
                centerX: centerX,
                centerY: centerY
              } );
              this.addChild( objectImage );
              objectImages.push( objectImage );
            }
          }
        }
      }
    }

  }
}

countingCommon.register( 'BaseNumberNode', BaseNumberNode );

export default BaseNumberNode;
