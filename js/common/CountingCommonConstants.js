// Copyright 2015-2021, University of Colorado Boulder

/**
 * Constants that are shared between the various portions of Counting Common code
 *
 * @author Sharfudeen Ashraf
 */

import Dimension2 from '../../../dot/js/Dimension2.js';
import countingCommon from '../countingCommon.js';
import appleImage from '../../images/apple_png.js';
import ballImage from '../../images/ball_png.js';
import dogImage from '../../images/dog_png.js';
import PlayObjectType from './model/PlayObjectType.js';
import turtleImage from '../../images/turtle_png.js';

// convenience map that links play object types to their corresponding images
const PLAY_OBJECT_TYPE_TO_IMAGE = {};
PLAY_OBJECT_TYPE_TO_IMAGE[ PlayObjectType.DOG ] = dogImage;
PLAY_OBJECT_TYPE_TO_IMAGE[ PlayObjectType.APPLE ] = appleImage;
PLAY_OBJECT_TYPE_TO_IMAGE[ PlayObjectType.TURTLE ] = turtleImage;
PLAY_OBJECT_TYPE_TO_IMAGE[ PlayObjectType.BALL ] = ballImage;

const CountingCommonConstants = {
  // Common colors
  CUE_FILL: 'rgb(63,63,183)',

  /**
   * {number} - Where is the boundary between paper number "move" targets and "split" targets, where 0 would be the
   * bottom of the paper number and 1 would be the top.
   */
  SPLIT_BOUNDARY_HEIGHT_PROPORTION: 0.55,

  /**
   * {number} - View coordinates per second for animation
   */
  ANIMATION_VELOCITY: 400,

  /**
   * {Object} - A map from digit length => how far away a number should be separated when it repels from another.
   */
  MOVE_AWAY_DISTANCE: { 1: 50, 2: 100, 3: 150, 4: 160 },

  PLAY_OBJECT_TYPE_TO_IMAGE: PLAY_OBJECT_TYPE_TO_IMAGE,
  PLAY_OBJECT_SIZE: new Dimension2( 64, 64 ) // in screen coordinates
};

countingCommon.register( 'CountingCommonConstants', CountingCommonConstants );

export default CountingCommonConstants;