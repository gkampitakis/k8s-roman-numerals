import { Schema } from '@gkampitakis/mongo-client';

let REGEX_CONTROL = true;
jest.mock('node-fetch');
jest.mock('./constants', () => ({
	ROMAN_REGEX: {
		test: (value) => REGEX_CONTROL
	}
}));
jest.mock('../../../configuration', () => ({
	worker: {
		host: 'mockHost/'
	}
}));
jest.mock('@gkampitakis/mongo-client');
jest.mock('../../Components');

import Controller from './controller';

describe('Controller', () => {
	const {
			ModelSpy,
			SchemaSpy,
			DELETE_MANY_SPY,
			CREATE_SPY,
			FIND_SPY,
			TO_ARRAY_SPY,
			FINDONE_SPY,
			MOCK_RESULTS
		} = jest.requireMock('@gkampitakis/mongo-client'),
		{ FETCH_SPY } = jest.requireMock('node-fetch'),
		{ SubscribeSpy, PublishSpy } = jest.requireMock('../../Components');

	beforeEach(() => {
		FETCH_SPY.mockClear();
		SchemaSpy.mockClear();
		DELETE_MANY_SPY.mockClear();
		FIND_SPY.mockClear();
		TO_ARRAY_SPY.mockClear();
		FINDONE_SPY.mockClear();

		REGEX_CONTROL = true;
		MOCK_RESULTS.result = [];
	});

	describe('Constructor', () => {
		it('Should initialize RedisClient', (done) => {
			setTimeout(() => {
				expect(ModelSpy).toHaveBeenNthCalledWith(1, 'numerals', expect.any(Schema));
				expect(PublishSpy).toHaveBeenNthCalledWith(1, 'new_value', { numeralComputation: 'mockDoc' });
				expect(SubscribeSpy).toHaveBeenNthCalledWith(1, 'new_request', expect.any(Function));
				expect(CREATE_SPY).toHaveBeenNthCalledWith(1, { arabic: 10, roman: '10' }, { lean: true });

				done();
			}, 100);
		});
	});

	describe('Delete all', () => {
		it('Should call deleteMany method', async () => {
			await Controller.deleteAll();
			expect(DELETE_MANY_SPY).toHaveBeenNthCalledWith(1, {});
		});
	});

	describe('Retrieve', () => {
		it('Should call find method', async () => {
			MOCK_RESULTS.result = ['mockResult'];
			const res = await Controller.retrieve('arabic');

			expect(FIND_SPY).toHaveBeenNthCalledWith(1, {}, { fields: { arabic: 1 } });
			expect(TO_ARRAY_SPY).toHaveBeenCalled();
			expect(res).toEqual(['mockResult']);
		});
	});

	describe('Convert to roman', () => {
		it('Should return error object', async () => {
			const res = await Controller.convertToRoman(-10);

			expect(res).toEqual({
				error: true,
				message: 'Wrong input provided'
			});
		});

		it('Should return cached message', async () => {
			MOCK_RESULTS.result = { roman: 'x', _id: '123456' };
			const res = await Controller.convertToRoman(10);

			expect(res).toEqual({
				message: 'Value cached',
				result: {
					_id: '123456',
					roman: 'x'
				}
			});
		});

		it('Should return message Converting value', async () => {
			MOCK_RESULTS.result = undefined;
			const res = await Controller.convertToRoman(10);

			expect(res).toEqual({
				message: 'Converting value'
			});
			expect(FETCH_SPY).toHaveBeenNthCalledWith(1, 'mockHost/roman/10');
		});
	});

	describe('Convert to arabic', () => {
		it('Should return error object', async () => {
			REGEX_CONTROL = false;
			const res = await Controller.convertToArabic('error');

			expect(res).toEqual({
				error: true,
				message: 'Wrong input provided'
			});
		});

		it('Should return cached message', async () => {
			MOCK_RESULTS.result = { arabic: 10, _id: '123456' };

			const res = await Controller.convertToArabic('error');

			expect(res).toEqual({
				message: 'Value cached',
				result: {
					_id: '123456',
					arabic: 10
				}
			});
		});

		it('Should return message Converting value', async () => {
			MOCK_RESULTS.result = undefined;
			const res = await Controller.convertToArabic('x');

			expect(res).toEqual({
				message: 'Converting value'
			});
			expect(FETCH_SPY).toHaveBeenNthCalledWith(1, 'mockHost/arabic/x');
		});
	});
});
