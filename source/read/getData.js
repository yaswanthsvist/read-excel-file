import dropEmptyRows from './dropEmptyRows'
import dropEmptyColumns from './dropEmptyColumns'

export default function getData(sheet, options) {
  const { dimensions, cells } = sheet

  // If the sheet is empty.
  if (cells.length === 0) {
    return []
  }

  const [leftTop, rightBottom] = dimensions

  // Don't discard empty rows or columns at the start.
  // https://github.com/catamphetamine/read-excel-file/issues/102
  // const colsCount = (rightBottom.column - leftTop.column) + 1
  // const rowsCount = (rightBottom.row - leftTop.row) + 1

  const colsCount = rightBottom.column
  const rowsCount = rightBottom.row

  // Initialize spreadsheet data structure.
  let data = new Array(rowsCount)
  let i = 0
  while (i < rowsCount) {
    data[i] = new Array(colsCount)
    let j = 0
    while (j < colsCount) {
      data[i][j] = null
      j++
    }
    i++
  }

  // Fill in spreadsheet data structure.
  // (this code implies that `cells` aren't necessarily sorted by row and column:
  //  maybe that's not correct, this piece code was initially copy-pasted
  //  from some other library that used `XPath`)
  for (const cell of cells) {
    // Don't discard empty rows or columns at the start.
    // https://github.com/catamphetamine/read-excel-file/issues/102
    // const rowIndex = cell.row - leftTop.row
    // const columnIndex = cell.column - leftTop.column
    const rowIndex = cell.row - 1
    const columnIndex = cell.column - 1
    data[rowIndex][columnIndex] = cell.value
  }

  // Fill in the row map.
  const { rowMap } = options
  if (rowMap) {
    let i = 0
    while (i < data.length) {
      rowMap[i] = i
      i++
    }
  }

  // Drop empty columns or rows.
  data = dropEmptyRows(
    dropEmptyColumns(data, { onlyTrimAtTheEnd: true }),
    { onlyTrimAtTheEnd: true, rowMap }
  )

  // Optionally transform data before applying `schema`.
  if (options.transformData) {
    data = options.transformData(data)
    // data = options.transformData(data, {
    //   dropEmptyRowsAndColumns(data) {
    //     return dropEmptyRows(dropEmptyColumns(data), { rowMap })
    //   }
    // })
  }

  return data
}