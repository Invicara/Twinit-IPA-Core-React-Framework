import React, { useEffect, useState } from 'react'
import SimpleTable from './SimpleTable';
import './SimpleTabbedTable.scss';
import clsx from "clsx";
import _ from 'lodash';

const SimpleTabbedTable = (props) => {

	const [selectedTab, setSelectedTab] = useState(_.keys(props.tabs)[0]);

	useEffect(() => {
		setSelectedTab(_.keys(props.tabs)[0])
	}, [props.tabs])

	let data = _.get(props, `tabs[${selectedTab}]`, []).map(key => [key, props.data?.[key]?.val]);

	return (
		<div className={`simple-tabbed-table ${props.className}`}>
		<div className="simple-tabbed-table__tabs">
			{_.keys(props.tabs).map(tab => (
			<div
					className={clsx(
						'simple-tabbed-table__tab',
						tab === selectedTab && '--selected'
					)}
					key={tab}
					onClick={() => setSelectedTab(tab)}
			>
				{tab}
			</div>
			))}
		</div>
			<SimpleTable className={`simple-property-grid simple-tabbed-table__table`} rows={data}/>
		</div>
	)
}

export default SimpleTabbedTable
