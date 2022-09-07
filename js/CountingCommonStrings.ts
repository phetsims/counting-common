// Copyright 2021-2022, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import countingCommon from './countingCommon.js';

type StringsType = {
  'counting-common': {
    'title': string;
    'titleStringProperty': TReadOnlyProperty<string>;
  }
};

const countingCommonStrings = getStringModule( 'COUNTING_COMMON' ) as StringsType;

countingCommon.register( 'countingCommonStrings', countingCommonStrings );

export default countingCommonStrings;
