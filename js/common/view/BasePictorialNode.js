// Copyright 2021, University of Colorado Boulder

/**
 * Creates image views for base numbers.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Chris Klusendorf (PhET Interactive Simulations), copied from counting-common and modified for number-play
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Shape from '../../../../kite/js/Shape.js';
import { Circle } from '../../../../scenery/js/imports.js';
import { Image } from '../../../../scenery/js/imports.js';
import { Node } from '../../../../scenery/js/imports.js';
import { Path } from '../../../../scenery/js/imports.js';
import { Rectangle } from '../../../../scenery/js/imports.js';
import countingCommon from '../../countingCommon.js';
import CountingCommonConstants from '../CountingCommonConstants.js';

class BasePictorialNode extends Node {
  /**
   * @param {BaseNumber} baseNumber
   * @param {boolean} isPartOfStack - does this baseNumber have other layers to it?
   * @param {EnumerationProperty.<PlayObjectType>} playObjectTypeProperty
   * @param {boolean} separateNumber - whether the objects should be show separated or grouped
   */
  constructor( baseNumber, value, isPartOfStack, playObjectTypeProperty, separateNumbers ) {
    super();

    // Translate everything by our offset
    this.translation = baseNumber.offset;

    // @private {EnumerationProperty.<PlayObjectType>}
    this.playObjectTypeProperty = playObjectTypeProperty;

    // saves the case from when value is 0
    value = Math.max( baseNumber.numberValue, value );

    // @public (read-only)
    this.backgroundNode = null;

    const ONE = 1;
    const TEN = 10;

    const fullObjectWidth = CountingCommonConstants.PLAY_OBJECT_SIZE.width;
    const fullObjectHeight = CountingCommonConstants.PLAY_OBJECT_SIZE.width;
    const singleCardSize = new Dimension2( 62, 100 );
    const doubleCardSize = new Dimension2( 118, 105 );
    const backgroundWidth = value < TEN ? singleCardSize.width : doubleCardSize.width;
    const backgroundHeight = value < TEN ? singleCardSize.height : doubleCardSize.height;
    const sideMargin = ( singleCardSize.width - fullObjectWidth ) / 2;

    if ( !separateNumbers ) {

      this.backgroundNode = new Rectangle( 0, 0, backgroundWidth, backgroundHeight, {
        fill: '#fafafa',
        cornerRadius: 8
      } );
      this.addChild( this.backgroundNode );

      // create and add the handle
      const lineWidth = 1.5;
      const handleHeight = 20;
      const handleStemShape = new Shape().moveTo( 0, 0 ).lineTo( 0, handleHeight );

      if ( value > 1 ) {

        // @public (read-only)
        this.handleStemNode = new Path( handleStemShape, {
          stroke: 'black',
          lineWidth: lineWidth
        } );
        this.handleStemNode.centerX = this.backgroundNode.centerX;
        this.handleStemNode.bottom = this.backgroundNode.top;
        this.addChild( this.handleStemNode );

        const handleCircle = new Circle( 5.5, {
          fill: 'white',
          stroke: 'black',
          lineWidth: lineWidth
        } );
        handleCircle.addChild( new Circle( 2.5, {
          fill: 'black'
        } ) );
        handleCircle.centerX = this.handleStemNode.centerX;
        handleCircle.bottom = this.handleStemNode.top;
        this.addChild( handleCircle );
      }
    }

    // TODO: temporary way to organize objects, needs work
    const numberOfRows = value === ONE ? 1 : 5;
    const numberOfColumns = value === ONE ? 1 : 2;
    const scale = value === ONE ? 1 : 0.3;
    const resetPoint = doubleCardSize.width / 2;

    // add and position the object images
    const objectImages = [];
    for ( let i = 0; i < 2; i++ ) {
      for ( let j = 0; j < numberOfRows; j++ ) {
        for ( let k = 0; k < numberOfColumns; k++ ) {

          const width = singleCardSize.width;
          const height = singleCardSize.height;

          const columnWidth = ( width - ( ( numberOfColumns + 1 ) * sideMargin ) ) / numberOfColumns;
          const centerX = i * resetPoint + ( ( k + 1 ) * sideMargin ) + ( k * columnWidth ) + ( columnWidth / 2 );

          const rowHeight = ( height - ( ( numberOfRows + 1 ) * sideMargin ) ) / numberOfRows;
          const centerY = ( ( j + 1 ) * sideMargin ) + ( j * rowHeight ) + ( rowHeight / 2 );

          if ( objectImages.length < value ) {
            const objectImage = new Image( CountingCommonConstants.PLAY_OBJECT_TYPE_TO_IMAGE[ playObjectTypeProperty.value ], {
              maxWidth: fullObjectWidth * scale,
              maxHeight: fullObjectHeight * scale,
              centerX: centerX,
              centerY: centerY
            } );
            this.addChild( objectImage );
            objectImages.push( objectImage );
          }
        }
      }
    }

    // @private
    this.playObjectTypeListener = playObjectType => {
      objectImages.forEach( objectImage => {
        objectImage.image = CountingCommonConstants.PLAY_OBJECT_TYPE_TO_IMAGE[ playObjectType ];
      } );
    };
    this.playObjectTypeProperty.link( this.playObjectTypeListener );
  }

  /**
   * @public
   */
  dispose() {
    this.playObjectTypeProperty.unlink( this.playObjectTypeListener );
    super.dispose();
  }
}

countingCommon.register( 'BasePictorialNode', BasePictorialNode );

export default BasePictorialNode;
