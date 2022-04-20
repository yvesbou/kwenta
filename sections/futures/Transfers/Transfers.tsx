import Card from 'components/Card';
import Table from 'components/Table';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';
import { CellProps } from 'recharts';
import styled from 'styled-components';
import { FlexDivCentered, GridDivCenteredRow } from 'styles/common';
import { formatCryptoCurrency } from 'utils/formatters/number';
import Trades from '../Trades';

type TransferProps = {
	isLoading: boolean;
	isLoaded: boolean;
};

const Transfers: FC<TransferProps> = ({ isLoading, isLoaded }: TransferProps) => {
	const { t } = useTranslation();
	return (
		<Card>
			<StyledTable
				// palette="primary"
				columns={[
					{
						Header: (
							<StyledTableHeader>
								{t('futures.market.user.transfers.table.action')}
							</StyledTableHeader>
						),
						accessor: 'id',
						// : CellProps<any></any>
						Cell: (cellProps: any) => {
							cellProps.value;
						},
						sortable: true,
						width: 50,
					},
					{
						Header: (
							<StyledTableHeader>
								{t('futures.market.user.transfers.table.amount')}
							</StyledTableHeader>
						),
						accessor: 'size',
						sortType: 'basic',
						// : CellProps<any></any>
						Cell: (cellProps: any) => (
							<FlexDivCentered>
								<CurrencyIcon currencyKey={cellProps.row.original.asset ?? ''} />
								<StyledPositionSize>
									{formatCryptoCurrency(cellProps.value, {
										currencyKey: cellProps.row.original.asset,
									})}
								</StyledPositionSize>
							</FlexDivCentered>
						),
						width: 100,
						sortable: true,
					},
					{
						Header: (
							<StyledTableHeader>{t('futures.market.user.transfers.table.date')}</StyledTableHeader>
						),
						accessor: 'id',
						// : CellProps<any></any>
						Cell: (cellProps: any) => {
							cellProps.value;
						},
						sortable: true,
						width: 50,
					},
					{
						Header: (
							<StyledTableHeader>
								{t('futures.market.user.transfers.table.transaction')}
							</StyledTableHeader>
						),
						accessor: 'id',
						// : CellProps<any></any>
						Cell: (cellProps: any) => {
							cellProps.value;
						},
						sortable: true,
						width: 50,
					},
				]}
				data={[]}
				isLoading={isLoading && !isLoaded}
				noResultsMessage={
					isLoaded && Trades.length === 0 ? (
						<TableNoResults>
							{/* <Svg src={NoNotificationIcon} /> */}
							{t('dashboard.transactions.table.no-results')}
						</TableNoResults>
					) : undefined
				}
				// showPagination={true}
			/>
		</Card>
	);
};

export default Transfers;

const StyledTable = styled(Table)`
	margin-top: 16px;
`;

const StyledTableHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.blueberry};
	text-transform: capitalize;
`;

const TableNoResults = styled(GridDivCenteredRow)`
	padding: 50px 0;
	justify-content: center;
	background-color: ${(props) => props.theme.colors.elderberry};
	margin-top: -2px;
	justify-items: center;
	grid-gap: 10px;
`;

const StyledPositionSize = styled.div`
	margin-left: 4px;
	/* ${BoldTableText} */
	text-transform: none;
`;
