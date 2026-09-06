import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Table, TableContainer, TableHead, TableBody, TableRow, TableCell, Paper, TextField, Box, Divider, TableSortLabel } from '@mui/material'
import { computeContent, isDateColumn, applyColumnFilters } from '../utils/viewUtils'
import DateRangeFilterPopover from './DateRangeFilterPopover'

function buildRows(data, groupKeys) {
    if (!groupKeys.length) {
        return data.map((item) => ({ groupCells: [], leaf: item }))
    }

    const [currentKey, ...restKeys] = groupKeys
    const groups = new Map()

    for (const item of data) {
        const mapKey = item[currentKey] == null ? '__uncategorized__' : JSON.stringify(item[currentKey])
        if (!groups.has(mapKey)) {
            groups.set(mapKey, [])
        }
        groups.get(mapKey).push(item)
    }

    const rows = []
    for (const items of groups.values()) {
        const childRows = buildRows(items, restKeys)
        childRows.forEach((row, i) => {
            rows.push({
                groupCells: [
                    { key: currentKey, span: childRows.length, isFirst: i === 0 },
                    ...row.groupCells,
                ],
                leaf: row.leaf,
            })
        })
    }
    return rows
}

const initColumnFilters = (keys) =>
    Object.fromEntries(keys.map((k) => [k, isDateColumn(k) ? { start: '', end: '' } : '']))

const GroupedTable = ({ data, groupKeys = [], columns = [], additionalComponents }) => {
    const [keyword, setKeyword] = useState('')
    const [selected, setSelected] = useState(null)
    const [columnFilters, setColumnFilters] = useState(() => initColumnFilters([...groupKeys, ...columns]))
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
    const labelRowRef = useRef(null)
    const [labelRowHeight, setLabelRowHeight] = useState(0)

    useEffect(() => {
        if (labelRowRef.current) {
            setLabelRowHeight(labelRowRef.current.offsetHeight)
        }
    }, [columns, groupKeys])

    const handleHeaderClick = (key) => {
        setSortConfig((prev) =>
            prev.key === key
                ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
                : { key, direction: 'asc' }
        )
    }

    useEffect(() => {
        setSelected(null)
        setColumnFilters(initColumnFilters([...groupKeys, ...columns]))
        setSortConfig({ key: null, direction: 'asc' })
    }, [data, groupKeys, columns])

    const filteredData = useMemo(() => {
        const allKeys = [...groupKeys, ...columns]
        const afterColumnFilters = applyColumnFilters(data, columnFilters, allKeys)
        if (!keyword.trim()) return afterColumnFilters
        const searchTerm = keyword.toLowerCase()
        return afterColumnFilters.filter((item) =>
            allKeys.some((key) => {
                const content = computeContent(item, key, true)
                return content && String(content).toLowerCase().includes(searchTerm)
            })
        )
    }, [data, keyword, columnFilters, groupKeys, columns])

    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData
        const key = sortConfig.key
        return [...filteredData].sort((a, b) => {
            let aVal, bVal
            if (isDateColumn(key)) {
                aVal = new Date(a[key]).getTime()
                bVal = new Date(b[key]).getTime()
            } else {
                aVal = computeContent(a, key, true) ?? ''
                bVal = computeContent(b, key, true) ?? ''
                const aNum = parseFloat(aVal)
                const bNum = parseFloat(bVal)
                if (!isNaN(aNum) && !isNaN(bNum)) {
                    aVal = aNum
                    bVal = bNum
                } else {
                    aVal = String(aVal).toLowerCase()
                    bVal = String(bVal).toLowerCase()
                }
            }
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
            return 0
        })
    }, [filteredData, sortConfig])

    const rows = useMemo(() => buildRows(sortedData, groupKeys), [sortedData, groupKeys])

    const totalCols = groupKeys.length + columns.length + (additionalComponents?.length || 0)

    const headerCellSx = { backgroundColor: '#1565c0', color: '#fff', fontWeight: 700, letterSpacing: '0.05em', border: '1px solid #0d47a1', verticalAlign: 'top' }

    return (
        <Box sx={{ paddingTop: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
                label="Search"
                variant="outlined"
                size="small"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                sx={{ width: 300 }}
            />
            <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', overflowX: 'hidden', width: '100%' }}>
                <Table stickyHeader sx={{ borderCollapse: 'collapse' }}>
                    <TableHead>
                        <TableRow ref={labelRowRef}>
                            {[...groupKeys, ...columns].map((key) => (
                                <TableCell key={key} sx={headerCellSx}>
                                    <TableSortLabel
                                        active={sortConfig.key === key}
                                        direction={sortConfig.key === key ? sortConfig.direction : 'asc'}
                                        onClick={() => handleHeaderClick(key)}
                                        sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', color: 'inherit', '&.Mui-active': { color: 'inherit' }, '& .MuiTableSortLabel-icon': { color: 'white !important' } }}
                                    >
                                        {key.split('_').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                            {additionalComponents?.map((comp) => (
                                <TableCell key={comp.label} sx={headerCellSx}>
                                    {comp.label.split('_').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')}
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow>
                            {[...groupKeys, ...columns].map((key) => {
                                const filter = columnFilters[key] ?? (isDateColumn(key) ? { start: '', end: '' } : '')
                                return (
                                    <TableCell key={key} sx={{ backgroundColor: '#1565c0', border: '1px solid #0d47a1', padding: '4px 8px', top: labelRowHeight }}>
                                        {isDateColumn(key)
                                            ? <DateRangeFilterPopover
                                                value={filter}
                                                onChange={(v) => setColumnFilters({ ...columnFilters, [key]: v })}
                                            />
                                            : <TextField
                                                size="small"
                                                value={filter}
                                                onChange={(e) => setColumnFilters({ ...columnFilters, [key]: e.target.value })}
                                                placeholder="Filter..."
                                                sx={{ width: '100%', '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
                                            />
                                        }
                                    </TableCell>
                                )
                            })}
                            {additionalComponents?.map((comp) => (
                                <TableCell key={comp.label} sx={{ backgroundColor: '#1565c0', border: '1px solid #0d47a1', top: labelRowHeight }} />
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, i) => {
                            const isLastInGroup =
                                groupKeys.length === 0 ||
                                i === rows.length - 1 ||
                                rows[i + 1]?.groupCells[0]?.isFirst

                            return (
                                <React.Fragment key={i}>
                                    <TableRow onClick={() => setSelected(selected === i ? null : i)}>
                                        {row.groupCells.map((cell, j) =>
                                            cell.isFirst ? (
                                                <TableCell
                                                    key={j}
                                                    rowSpan={cell.span}
                                                    sx={{
                                                        border: '1px solid #bdbdbd',
                                                        backgroundColor: Array.from(
                                                            { length: cell.span },
                                                            (_, k) => i + k
                                                        ).some((k) => selected === k)
                                                            ? 'lightblue'
                                                            : 'white'
                                                    }}
                                                >
                                                    {computeContent(row.leaf, cell.key)}
                                                </TableCell>
                                            ) : null
                                        )}
                                        {columns.map((col) => (
                                            <TableCell
                                                key={col}
                                                sx={{ border: '1px solid #bdbdbd', backgroundColor: selected === i ? 'lightblue' : 'white' }}
                                            >
                                                {computeContent(row.leaf, col)}
                                            </TableCell>
                                        ))}
                                        {additionalComponents?.map((comp) => (
                                            <TableCell
                                                key={comp.label}
                                                sx={{ border: '1px solid #bdbdbd', backgroundColor: selected === i ? 'lightblue' : 'white' }}
                                            >
                                                <comp.component item={row.leaf} {...comp.props} />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                    {isLastInGroup && groupKeys.length > 0 && (
                                        <TableRow>
                                            <TableCell colSpan={totalCols} sx={{ padding: 0 }}>
                                                <Divider style={{ backgroundColor: 'black', height: '3px' }} />
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            )
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    )
}

export default GroupedTable
