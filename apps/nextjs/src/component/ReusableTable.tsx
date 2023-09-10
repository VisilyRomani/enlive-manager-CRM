/* eslint-disable react/jsx-key */
import React, {
  MouseEventHandler,
  PropsWithChildren,
  ReactElement,
  useEffect,
} from "react";

import {
  Row,
  TableInstance,
  TableOptions,
  TableState,
  useTable,
  useGlobalFilter,
  useFilters,
  useSortBy,
} from "react-table";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

interface TableProps<T extends Record<string, unknown>>
  extends TableOptions<T> {
  name: string;
  onAdd?: (instance: TableInstance<T>) => MouseEventHandler;
  onDelete?: (instance: TableInstance<T>) => MouseEventHandler;
  onEdit?: (instance: TableInstance<T>) => MouseEventHandler;
  onClick?: (row: Row<T>) => void;
  onRefresh?: MouseEventHandler;
  initialState?: Partial<TableState<T>>;
  GlobalFilter?: string;
  filter?: { id: string; value: string };
  sortees?: {
    id: string;
    desc: boolean;
  }[];
}

const ReusableTable = <T extends Record<string, unknown>>(
  props: PropsWithChildren<TableProps<T>>
): ReactElement => {
  const { columns, data, GlobalFilter, sortees, filter } = props;
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setGlobalFilter,
    setFilter,
  } = useTable(
    {
      initialState: {
        ...(sortees && { sortBy: sortees }),
      },

      data,
      columns,
    },
    useFilters,
    useGlobalFilter,
    useSortBy
  );

  useEffect(() => {
    setGlobalFilter(GlobalFilter);
  }, [GlobalFilter, setGlobalFilter]);

  useEffect(() => {
    filter && setFilter(filter.id, filter.value);
  }, [filter, setFilter]);

  return (
    <div className="overflow-auto">
      <table
        className="w-full text-sm text-left text-gray-500 relative border-collapse"
        {...getTableProps()}
      >
        <thead className="Rthead">
          {headerGroups?.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  scope="col"
                  className="py-3 px-6 sticky top-0 text-xs text-gray-700 uppercase bg-gray-50 text-center"
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  style={{
                    fontWeight: "bold",
                    zIndex: 0,
                  }}
                >
                  <div className="w-full flex flex-row gap-3 items-center justify-center">
                    {column.render("Header")}
                    <span>
                      {column.isSorted ? (
                        column.isSortedDesc ? (
                          <FaSortDown />
                        ) : (
                          <FaSortUp />
                        )
                      ) : (
                        <FaSort />
                      )}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="my-2" {...getTableBodyProps()}>
          {rows?.map((row) => {
            prepareRow(row);
            return (
              <tr className="bg-white border-b " {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    <td
                      className="py-1 px-2 text-center Rtdata"
                      {...cell.getCellProps()}
                      datatype={
                        cell.column.Header?.toString()
                          ? cell.column.Header?.toString() + ": "
                          : ""
                      }
                    >
                      {cell.render("Cell")}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ReusableTable;
