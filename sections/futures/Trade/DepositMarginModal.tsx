import { FC, useState, useMemo, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { ethers } from 'ethers';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Wei, { wei } from '@synthetixio/wei';
import useSynthetixQueries from '@synthetixio/queries';

import TransactionNotifier from 'containers/TransactionNotifier';
import { normalizeGasLimit } from 'utils/network';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import BaseModal from 'components/BaseModal';
import { gasSpeedState } from 'store/wallet';

import { FlexDivCol } from 'styles/common';
import Button from 'components/Button';
import { getTransactionPrice } from 'utils/network';
import { getFuturesMarketContract } from 'queries/futures/utils';

import GasPriceSelect from 'sections/shared/components/GasPriceSelect';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { Synths } from 'constants/currency';
import Connector from 'containers/Connector';
import MarginInput from '../TradeSizeInput';

type DepositMarginModalProps = {
	onDismiss: () => void;
	onTxConfirmed: () => void;
	sUSDBalance: Wei;
	market: string | null;
};

const DepositMarginModal: FC<DepositMarginModalProps> = ({
	onDismiss,
	sUSDBalance,
	market,
	onTxConfirmed,
}) => {
	const { t } = useTranslation();
	const { synthetixjs } = Connector.useContainer();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const [amount, setAmount] = useState<string>('');
	const gasSpeed = useRecoilValue(gasSpeedState);
	const [gasLimit, setGasLimit] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);
	const { useExchangeRatesQuery, useEthGasPriceQuery } = useSynthetixQueries();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const ethGasPriceQuery = useEthGasPriceQuery(true);
	const exchangeRatesQuery = useExchangeRatesQuery();
	const gasPrices = useMemo(
		() => (ethGasPriceQuery.isSuccess ? ethGasPriceQuery?.data ?? undefined : undefined),
		[ethGasPriceQuery.isSuccess, ethGasPriceQuery.data]
	);

	const exchangeRates = useMemo(
		() => (exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null),
		[exchangeRatesQuery.isSuccess, exchangeRatesQuery.data]
	);

	const ethPriceRate = useMemo(
		() => getExchangeRatesForCurrencies(exchangeRates, Synths.sETH, selectedPriceCurrency.name),
		[exchangeRates, selectedPriceCurrency.name]
	);

	const gasPrice = useMemo(
		() =>
			ethGasPriceQuery.isSuccess
				? ethGasPriceQuery?.data != null
					? ethGasPriceQuery.data[gasSpeed]
					: null
				: null,
		[ethGasPriceQuery.isSuccess, ethGasPriceQuery.data, gasSpeed]
	);

	const transactionFee = useMemo(() => getTransactionPrice(gasPrice, gasLimit, ethPriceRate), [
		gasPrice,
		gasLimit,
		ethPriceRate,
	]);

	useEffect(() => {
		const getGasLimit = async () => {
			if (!amount || !market || !synthetixjs) return;
			try {
				setError(null);
				const FuturesMarketContract: ethers.Contract = getFuturesMarketContract(
					market,
					synthetixjs!.contracts
				);
				const estimate = await FuturesMarketContract.estimateGas.modifyMargin(wei(amount).toBN());
				setGasLimit(normalizeGasLimit(Number(estimate)));
			} catch (e) {
				console.log(e.message);
				setError(e?.data?.message ?? e.message);
			}
		};
		getGasLimit();
	}, [amount, market, synthetixjs]);

	const handleDeposit = async () => {
		if (!amount || !gasLimit || !market) return;
		try {
			const FuturesMarketContract: ethers.Contract = getFuturesMarketContract(
				market,
				synthetixjs!.contracts
			);
			const tx = await FuturesMarketContract.modifyMargin(wei(amount).toBN(), {
				gasLimit,
				gasPrice,
			});
			if (tx != null) {
				monitorTransaction({
					txHash: tx.hash,
					onTxConfirmed: () => {
						onTxConfirmed();
						onDismiss();
					},
				});
			}
		} catch (e) {
			console.log(e);
			setError(e?.data?.message ?? e.message);
		}
	};

	return (
		<StyledBaseModal
			onDismiss={onDismiss}
			isOpen={true}
			title={t('futures.market.trade.margin.modal.title')}
		>
			<MarginInput
				amount={amount}
				onAmountChange={(value) => setAmount(value)}
				balance={sUSDBalance}
				asset={Synths.sUSD}
				balanceLabel={t('futures.market.trade.margin.balance')}
			/>
			<FlexDivCol>
				<StyledGasPriceSelect {...{ gasPrices, transactionFee }} />
			</FlexDivCol>
			<DepositMarginButton
				variant="primary"
				isRounded
				size="lg"
				onClick={handleDeposit}
				disabled={!gasLimit || !!error}
			>
				{error ? error : t('futures.market.trade.button.deposit-margin')}
			</DepositMarginButton>
		</StyledBaseModal>
	);
};

const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}
	.card-body {
		padding: 28px;
	}
`;

const StyledGasPriceSelect = styled(GasPriceSelect)`
	padding: 5px 0;
	display: flex;
	justify-content: space-between;
	width: auto;
	border-bottom: 1px solid ${(props) => props.theme.colors.navy};
	color: ${(props) => props.theme.colors.blueberry};
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.bold};
	text-transform: capitalize;
	margin-bottom: 8px;
`;

const DepositMarginButton = styled(Button)`
	width: 100%;
	margin-top: 24px;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
`;

export default DepositMarginModal;
