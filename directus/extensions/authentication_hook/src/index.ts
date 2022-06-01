import { defineHook } from '@directus/extensions-sdk';

export default defineHook(({ filter}, { getSchema, services: { RolesService, UsersService } }) => {

	filter('authenticate', async (payload, { req }, { database }) => {

		// Only handle authentication for item API requests
		if (req.path.indexOf('/items') != 0) {
			return payload;
		}

		var schema = await getSchema();
		const roles = new RolesService({knex: database, schema});
		const users = new UsersService({knex: database, schema});

		const CLIENTID = "some-api-user-3";
		const ROLE = "districts:read";

		console.log("Getting user");

		var userResult = await users.readByQuery({
			filter: {
				first_name: {
					_eq: CLIENTID,
				},
			},
			fields: ["id"]
		});

		let userId: string = "";

		if (userResult.length == 0) {
			const user = await users.createOne({
				first_name: CLIENTID,
			});
			console.log("Created user: ", user);
			userId = user;
		} else {
			userId = userResult[0].id;
		}

		
		console.log("Getting roles");

		var result = await roles.readByQuery({
			filter: {
				name: {
					_eq: 'districts:read',
				},
			},
			fields: ["id","users.id"]
		});

		console.log("Got roles: " + result.length);

		const accountability = { role: "", user: "", admin: false, ip: "", userAgent: "" };

		if (result.length > 0) {

			console.log('User ID: ' + userId);
			console.log('Role ID: ' + result[0].id);
			accountability.user = userId; 
			accountability.role = result[0].id; 
			accountability.admin = false;
			accountability.ip = payload.ip;
			accountability.userAgent = payload.userAgent;

		}

		// req.accountability = accountability;

		//console.log('Authenticating: accountability', accountability);
		//console.log('Authenticating: meta', meta);
		//console.log('Authenticating: context', context);

		return accountability;
	});

});
