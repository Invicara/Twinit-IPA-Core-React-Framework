const toIndexedList = (list, idGetter) => list.reduce((accum, element, i) => ({
    ...accum,
    [idGetter ? idGetter(element) : i]: {...element, id: idGetter ? idGetter(element) : i}
}), {});