import React, {useState, useMemo, useEffect, useCallback} from "react";
import './EntityListView.scss'

export const ASCENDING_ORDER = 'asc';
export const DESCENDING_ORDER = 'desc';
export const ENTITY_LIST_SORT_PREFERENCE = 'entityListSortPreference';

export default function useSortEntities (entitySingular, onSortChange) {

    const key = ENTITY_LIST_SORT_PREFERENCE + entitySingular;
    const sessionPreference = sessionStorage.getItem(key);
    const sortPreference = sessionPreference ? JSON.parse(sessionPreference) : {
        property: 'Entity Name',
        valueAccessor: 'Entity Name',
        order: ASCENDING_ORDER
    };

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


