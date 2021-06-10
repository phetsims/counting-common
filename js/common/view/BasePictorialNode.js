// Copyright 2019-2021, University of Colorado Boulder

/**
 * Creates image views for base numbers.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Chris Klusendorf (PhET Interactive Simulations), copied from counting-common and modified for number-play
 */

import Shape from '../../../../kite/js/Shape.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import cornerPeelImage from '../../../images/corner-peel_png.js';
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

    // saves the case from when value is 0
    value = Math.max( baseNumber.numberValue, value );

    let backgroundNode;

    const objectWidth = CountingCommonConstants.PLAY_OBJECT_SIZE.width;
    const objectHeight = CountingCommonConstants.PLAY_OBJECT_SIZE.width;
    const stackOffset = 10;
    const sideMargin = 10;

    // add a background if there's a least 2 objects together
    if ( value > 1 && !separateNumbers ) {
      const backgroundWidth = objectWidth + 2 * sideMargin + ( value - 1 ) * stackOffset;
      const backgroundHeight = objectHeight + 3 * sideMargin + value * stackOffset;

      backgroundNode = new Rectangle( 0, 0, backgroundWidth, backgroundHeight, {
        fill: '#e8f6ff',
        cornerRadius: 10
      } );

      // create and add the corner peel
      const cornerPeelImageNode = new Image( cornerPeelImage, {
        maxHeight: 18,
        top: backgroundNode.top,
        right: backgroundNode.right
      } );
      backgroundNode.addChild( cornerPeelImageNode );
      this.addChild( backgroundNode );
    }

    // add and position the object images
    for ( let i = 0; i < value; i++ ) {
      const offset = ( sideMargin + i * stackOffset );
      const objectImage = new Image( CountingCommonConstants.PLAY_OBJECT_TYPE_TO_IMAGE[ playObjectTypeProperty.value ], {
        maxWidth: objectWidth,
        maxHeight: objectHeight,
        x: offset,
        y: offset
      } );
      this.addChild( objectImage );
      playObjectTypeProperty.link( playObjectType => {
        objectImage.image = CountingCommonConstants.PLAY_OBJECT_TYPE_TO_IMAGE[ playObjectType ];
      } );
    }

    // TODO: these should be elminated with future designs, see https://github.com/phetsims/number-play/issues/19
    // add the grippy lines if this number is on the top layer
    if ( value > 1 && !separateNumbers ) {

      // empirically determined to put the grippy in the same place in relation to the paper number's digit
      const yMargin = baseNumber.place >= 1 ? 22 : 13;
      const lineLength = 40;    // empirically determined
      const lineSeparation = 4; // empirically determined
      const grippyLines = new Path( new Shape()
        .moveTo( 0, 0 ).lineTo( lineLength, 0 ).moveTo( 0, lineSeparation ).lineTo( lineLength, lineSeparation ).close(), {
        stroke: 'rgb( 204, 204, 204 )',
        lineWidth: 1,
        centerX: backgroundNode.centerX,
        bottom: backgroundNode.bottom - yMargin
      } );
      this.addChild( grippyLines );
    }
  }
}

countingCommon.register( 'BasePictorialNode', BasePictorialNode );

export default BasePictorialNode;
