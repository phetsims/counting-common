// Copyright 2021-2023, University of Colorado Boulder

/**
 * Constants that are shared between the various portions of Counting Common code
 *
 * @author Sharfudeen Ashraf
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Dimension2 from '../../../dot/js/Dimension2.js';
import countingCommon from '../countingCommon.js';
import apple_png from '../../images/apple_png.js';
import ball_png from '../../images/ball_png.js';
import dog_png from '../../images/dog_png.js';
import CountingObjectType from './model/CountingObjectType.js';
import butterfly_png from '../../images/butterfly_png.js';
import Bounds2 from '../../../dot/js/Bounds2.js';

// convenience map that links counting object types to their corresponding images
const COUNTING_OBJECT_TYPE_TO_IMAGE = new Map();
COUNTING_OBJECT_TYPE_TO_IMAGE.set( CountingObjectType.DOG, dog_png );
COUNTING_OBJECT_TYPE_TO_IMAGE.set( CountingObjectType.APPLE, apple_png );
COUNTING_OBJECT_TYPE_TO_IMAGE.set( CountingObjectType.BUTTERFLY, butterfly_png );
COUNTING_OBJECT_TYPE_TO_IMAGE.set( CountingObjectType.BALL, ball_png );

const MOVE_AWAY_DISTANCE: Record<number, number> = { 1: 50, 2: 100, 3: 150, 4: 160 };

const CountingCommonConstants = {
  // Common colors
  CUE_FILL: 'rgb(63,63,183)',

  /**
   * {number} - Where is the boundary between paper number "move" targets and "split" targets, where 0 would be the
   * bottom of the paper number and 1 would be the top. TODO: should be removed with the completion of
   * https://github.com/phetsims/counting-common/issues/13
   */
  SPLIT_BOUNDARY_HEIGHT_PROPORTION: 0.78,

  /**
   * {number} - View coordinates per second for animation
   */
  ANIMATION_VELOCITY: 400,

  /**
   * {Object} - A map from digit length => how far away a number should be separated when it repels from another.
   */
  MOVE_AWAY_DISTANCE: MOVE_AWAY_DISTANCE,

  COUNTING_PLAY_AREA_MARGIN: 10,
  // TODO: need better plan for this, see https://github.com/phetsims/counting-common/issues/12
  SINGLE_COUNTING_OBJECT_BOUNDS: new Bounds2( -21, 0, 33.6, 87.78 ), // from rendered images
  COUNTING_OBJECT_TYPE_TO_IMAGE: COUNTING_OBJECT_TYPE_TO_IMAGE,
  PLAY_OBJECT_SIZE: new Dimension2( 44, 44 ), // in screen coordinates
  BREAK_APART_Y_OFFSET: 6 // y-offset for individual CountingObjects, used when breaking apart a group
};

countingCommon.register( 'CountingCommonConstants', CountingCommonConstants );

export default CountingCommonConstants;