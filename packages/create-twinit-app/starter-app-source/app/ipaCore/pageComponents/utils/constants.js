export const VALID_FILE_EXT = ['.bimpk', '.sgpk'];

export const MISSING_RELATIONS_COLUMNS = [
  {
    Header: 'Entity Type',
    width: 100,
    accessor: 'EntityType',
    style: {
      textAlign: 'center',
    },
    id: 'entityType',
  },
  {
    Header: 'Name',
    accessor: 'Name',
    headerStyle: {
      textAlign: 'left',
    },
    id: 'name',
  },
];