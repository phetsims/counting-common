// Copyright 2019-2021, University of Colorado Boulder

/**
 * Play object types for counting-common.
 *
 * @author Chris Klusendorf
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import countingCommon from '../../countingCommon.js';

// @public
const PlayObjectType = Enumeration.byKeys( [ 'DOG', 'APPLE', 'TURTLE', 'BALL' ] );

countingCommon.register( 'PlayObjectType', PlayObjectType );
export default PlayObjectType;