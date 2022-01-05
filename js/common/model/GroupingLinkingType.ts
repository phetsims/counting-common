// Copyright 2021-2022, University of Colorado Boulder

/**
 * The 3 possible states of grouping + linking in a play area
 *
 * @author Chris Klusendorf
 */

const GroupingLinkingTypeValues = [ 'UNGROUPED', 'GROUPED', 'GROUPED_AND_LINKED' ] as const;
type GroupingLinkingType = typeof GroupingLinkingTypeValues[number];

export { GroupingLinkingTypeValues };
export type { GroupingLinkingType as default };