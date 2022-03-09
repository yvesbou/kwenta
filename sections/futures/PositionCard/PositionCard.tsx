import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { wei } from '@synthetixio/wei';

import { FlexDiv, FlexDivCol } from 'styles/common';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import { useTranslation } from 'react-i18next';
import { formatCurrency, zeroBN } from 'utils/formatters/number';
import { Synths } from 'constants/currency';
import ChangePercent from 'components/ChangePercent';
import Button from 'components/Button';
import { FuturesPosition, PositionSide } from 'queries/futures/types';
import { formatNumber } from 'utils/formatters/number';
import ClosePositionModal from './ClosePositionModal';
import { useRouter } from 'next/router';

type PositionCardProps = {
	currencyKey: string;
	position: FuturesPosition | null;
	currencyKeyRate: number;
	onPositionClose?: () => void;
	dashboard?: boolean;
};

const PositionCard: React.FC<PositionCardProps> = ({
	currencyKey,
	position,
	currencyKeyRate,
	onPositionClose,
	dashboard,
}) => {
	const { t } = useTranslation();
	const router = useRouter();
	const positionDetails = position?.position ?? null;
	const [closePositionModalIsVisible, setClosePositionModalIsVisible] = useState<boolean>(false);

	return (
		<>
			<Container>
				<DataCol>
					<InfoCol>
						<CurrencyInfo>
							<StyledCurrencyIcon currencyKey={currencyKey} />
							<div>
								<CurrencySubtitle>{currencyKey}/sUSD</CurrencySubtitle>
								<StyledValue>Synthetic Bitcoin</StyledValue>
							</div>
						</CurrencyInfo>
					</InfoCol>
					<PositionInfoCol>
						<StyledSubtitle>Position</StyledSubtitle>
						<PositionValue side={positionDetails?.side ?? PositionSide.LONG}>
							{positionDetails?.side ?? PositionSide.LONG} ↗
						</PositionValue>
					</PositionInfoCol>
				</DataCol>
				<DataCol>
					<InfoCol>
						<StyledSubtitle>Size</StyledSubtitle>
						<StyledValue>8.98 ($4,131.23)</StyledValue>
					</InfoCol>
					<InfoCol>
						<StyledSubtitle>Unrealized P&amp;L</StyledSubtitle>
						<StyledValue>$4,131.23 (1.53%)</StyledValue>
					</InfoCol>
				</DataCol>
				<DataCol>
					<InfoCol>
						<StyledSubtitle>Leverage</StyledSubtitle>
						<StyledValue>4.12x</StyledValue>
					</InfoCol>
					<InfoCol>
						<StyledSubtitle>Liq. Price</StyledSubtitle>
						<StyledValue>
							{formatCurrency(Synths.sUSD, positionDetails?.liquidationPrice ?? zeroBN, {
								sign: '$',
							})}
						</StyledValue>
					</InfoCol>
				</DataCol>
				<DataCol>
					<InfoCol>
						<StyledSubtitle>Average Open</StyledSubtitle>
						<StyledValue>$4,131.23</StyledValue>
					</InfoCol>
					<InfoCol>
						<StyledSubtitle>Average Close</StyledSubtitle>
						<StyledValue>$4,131.23</StyledValue>
					</InfoCol>
				</DataCol>
				<DataCol>
					<InfoCol>
						<StyledSubtitle>Realized P&amp;L</StyledSubtitle>
						<StyledValue>-$10.83</StyledValue>
					</InfoCol>
					<InfoCol>
						<StyledSubtitle>Net Funding</StyledSubtitle>
						<StyledValue>-$10.83</StyledValue>
					</InfoCol>
				</DataCol>
				<DataCol style={{ justifyContent: 'flex-end' }}>
					{onPositionClose && (
						<CloseButton
							isRounded={true}
							size="sm"
							variant="danger"
							onClick={() => setClosePositionModalIsVisible(true)}
							disabled={!positionDetails}
						>
							{t('futures.market.user.position.close-position')}
						</CloseButton>
					)}
				</DataCol>
			</Container>
			{closePositionModalIsVisible && onPositionClose && (
				<ClosePositionModal
					position={positionDetails}
					currencyKey={currencyKey}
					onPositionClose={onPositionClose}
					onDismiss={() => setClosePositionModalIsVisible(false)}
				/>
			)}
		</>
	);
};
export default PositionCard;

const Container = styled.div`
	display: grid;
	grid-template-columns: repeat(6, 1fr);
	grid-gap: 16px;
	background-color: transparent;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	padding: 22px;
	border-radius: 16px;
`;

const StyledCurrencyIcon = styled(CurrencyIcon)`
	width: 30px;
	height: 30px;
	margin-right: 8px;
`;

const DataCol = styled(FlexDivCol)`
	justify-content: space-between;
`;

const InfoCol = styled(FlexDivCol)`
	margin-bottom: 8px;
`;

const StyledSubtitle = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 13px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	text-transform: capitalize;
	margin-bottom: 4px;
`;

const StyledValue = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};
`;

const CloseButton = styled(Button)`
	height: 36px;
	font-size: 13px;
`;

const CurrencySubtitle = styled(StyledSubtitle)`
	text-transform: initial;
`;

const PositionInfoCol = styled(InfoCol)`
	padding-left: 38px;
`;

const PositionValue = styled.p<{ side: PositionSide }>`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 12px;
	text-transform: uppercase;
	margin: 0;

	${(props) =>
		props.side === PositionSide.LONG &&
		css`
			color: ${props.theme.colors.common.primaryGreen};
		`}

	${(props) =>
		props.side === PositionSide.SHORT &&
		css`
			color: ${props.theme.colors.common.primaryRed};
		`}
`;

const CurrencyInfo = styled(FlexDiv)`
	align-items: flex-start;
`;