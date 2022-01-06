// Copyright 2021, University of Colorado Boulder

/**
 * The 3 possible states of grouping + linking in a play area
 *
 * @author Chris Klusendorf
 */

const GroupingLinkingTypeValues = [ 'NO_GROUPING', 'GROUPING', 'GROUPING_AND_LINKED' ] as const;
type GroupingLinkingType = typeof GroupingLinkingTypeValues[number];

export { GroupingLinkingTypeValues };
export type { GroupingLinkingType as default };