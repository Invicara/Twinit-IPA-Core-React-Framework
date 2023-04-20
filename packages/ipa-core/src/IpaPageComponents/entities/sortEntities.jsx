import React, {useState, useMemo, useEffect, useReducer} from "react";
import './EntityListView.scss'

export const ASCENDING_ORDER = 'asc';
export const DESCENDING_ORDER = 'desc';
export const ENTITY_LIST_SORT_PREFERENCE = 'entityListSortPreference';

export default function useSortEntities (entitySingular, onSortChange, initialSort = {
    property: 'Entity Name',
    valueAccessor: 'Entity Name',
    order: ASCENDING_ORDER
}) {

    const key = ENTITY_LIST_SORT_PREFERENCE + entitySingular;
    const sessionPreference = sessionStorage.getItem(key);
    const sortPreference = sessionPreference ? JSON.parse(sessionPreference) : initialSort;

    const [currentSort, setSort] = useState(sortPreference);

    const sortEntitiesBy = (colAccessor) => {
        let order = currentSort.property == colAccessor ? currentSort.order == ASCENDING_ORDER ? DESCENDING_ORDER : ASCENDING_ORDER : ASCENDING_ORDER;
        //TODO: we might need a better condition than to check if the column accessor has a . in it. This condition will hold for all properties however.
        const sortValue = {
            valueAccessor: !colAccessor.includes('.') || colAccessor.includes('.val') ? colAccessor : colAccessor + '.val',
            property: colAccessor,
            order: order
        };
        setSort(sortValue);
        sessionStorage.setItem(key, JSON.stringify(sortValue));
    }

    useEffect(() => {
        onSortChange && onSortChange(currentSort);
    }, [currentSort])

    return {sortEntitiesBy, currentSort}
}

export function convertOffsetToPage (offset, pageSize, pageOneBased = false) {
    const page = (offset + pageSize) / pageSize;
    return Math.floor(page) - (pageOneBased ? 0 : 1);
}

export function convertPageToOfset (page, rowsPerPage, pageOneBased = false) {
    const offset = (page - pageOneBased ? 1 : 0) * rowsPerPage;
    return offset;
}

const paginateEntitiesReducer = (state, action) => {
    switch (action.type) {
        case 'paginate':
            const {page, rowsPerPage, count} = action;
            return {...state, page, rowsPerPage, count};
        default:
            return {...state};
    }
}

/**
 *
 * @param initialPagination
 * @param onPageChange
 * @param onRowsPerPageChange
 * @returns {{count, paginateTableBy: paginateTableBy, page, rowsPerPage}}
 */
export function usePaginateEntities(initialPagination, onPageChange, onRowsPerPageChange) {

    const {offset: initialOffset = 0, pageSize: initialPageSize = 200, total: initialTotal = 0 } = initialPagination;
    const initialPage = convertOffsetToPage(initialOffset,initialPageSize) * initialPageSize;

    const [pagination, dispatch] = useReducer(paginateEntitiesReducer, {page: initialPage, rowsPerPage: initialPageSize, count: initialTotal});

    const paginateTableBy = ({offset, pageSize, total}) => {
        let {page, rowsPerPage, count} = pagination;
        if(!isNaN(pageSize)){rowsPerPage = pageSize};
        if(!isNaN(total)){count = total};
        if(!isNaN(offset)){page = convertOffsetToPage(offset,rowsPerPage);}
        dispatch({type: 'paginate', page, rowsPerPage, count});
    }

    useEffect(() => {
        onPageChange && onPageChange(pagination.page);
    }, [pagination.page]);

    useEffect(() => {
        onRowsPerPageChange && onRowsPerPageChange(pagination.rowsPerPage);
    }, [pagination.rowsPerPage])

    const {page, rowsPerPage, count} = pagination;
    return {paginateTableBy, page, rowsPerPage, count};
}


