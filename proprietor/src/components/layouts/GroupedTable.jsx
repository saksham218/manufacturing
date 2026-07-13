import React, { useState, useEffect, useMemo } from 'react'
import { Table, TableContainer, TableHead, TableBody, TableRow, TableCell, Paper, TextField, Box, Divider } from '@mui/material'
import { computeContent } from '../utils/viewUtils'

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

const GroupedTable = ({ data, groupKeys = [], columns = [], additionalComponents }) => {
    const [keyword, setKeyword] = useState('')
    const [selected, setSelected] = useState(null)

    useEffect(() => {
        setSelected(null)
    }, [data, groupKeys])

    const filteredData = useMemo(() => {
        if (!keyword.trim()) return data || []
        const searchTerm = keyword.toLowerCase()
        return (data || []).filter((item) =>
            [...groupKeys, ...columns].some((key) => {
                const content = computeContent(item, key, true)
                return content && String(content).toLowerCase().includes(searchTerm)
            })
        )
    }, [data, keyword, groupKeys, columns])

    const rows = useMemo(() => buildRows(filteredData, groupKeys), [filteredData, groupKeys])

    const totalCols = groupKeys.length + columns.length + (additionalComponents?.length || 0)

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
                        <TableRow>
                            {groupKeys.map((k) => (
                                <TableCell key={k} sx={{ backgroundColor: '#1565c0', color: '#fff', fontWeight: 700, letterSpacing: '0.05em', border: '1px solid #0d47a1' }}>
                                    {k.split('_').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')}
                                </TableCell>
                            ))}
                            {columns.map((c) => (
                                <TableCell key={c} sx={{ backgroundColor: '#1565c0', color: '#fff', fontWeight: 700, letterSpacing: '0.05em', border: '1px solid #0d47a1' }}>
                                    {c.split('_').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')}
                                </TableCell>
                            ))}
                            {additionalComponents?.map((comp) => (
                                <TableCell key={comp.label} sx={{ backgroundColor: '#1565c0', color: '#fff', fontWeight: 700, letterSpacing: '0.05em', border: '1px solid #0d47a1' }}>
                                    {comp.label.split('_').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')}
                                </TableCell>
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
