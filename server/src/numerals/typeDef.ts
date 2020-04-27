import { gql } from 'apollo-server-fastify';

export const typeDef = gql`
	type Arabic {
		_id: String!
		arabic: Int!
	}

	type Roman {
		_id: String!
		roman: String!
	}

	type Message {
		message: String!
	}

	type Query {
		arabics(limit: Int, skip: Int): [Arabic]
		romans(limit: Int, skip: Int): [Roman]
	}

	type Mutation {
		deleteAll: Message!
		convertToRoman(value: Int!): Message!
		convertToArabic(value: String!): Message!
	}
`;
