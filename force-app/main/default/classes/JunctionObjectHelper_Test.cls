/**
 * Junction Object Helper test class
 */
@isTest
private class JunctionObjectHelper_Test {

	//---------------------------------------------getMaster2RecordsTest()-----------------------------------------------

	/**
	 * getMaster2Records : master's Object doesn't exist.
	 */
	@isTest
	private static void getMaster2RecordsTest1() {
		try {
			JunctionObjectHelper.getMaster2Records('DoesNotExit', 'DoesNotExist', new List<String> {
				'Name'
			}, 0);
			System.assert(false);
		} catch (Exception e) {
			System.assert(true);
		}
	}

	/**
	 * getMaster2Records : get two accounts
	 */
	@isTest
	private static void getMaster2RecordsTest2() {
		List<Account> accounts = new List<Account> ();
		Account acct1 = new Account(Name = 'TestAccount1', Description = 'Description1');
		accounts.add(acct1);
		Account acct2 = new Account(Name = 'TestAccount2', Description = 'Description2');
		accounts.add(acct2);
		insert accounts;

		List<SObject> resultList = JunctionObjectHelper.getMaster2Records('Account', 'Name', new List<String> {
			'Name', 'Description'
		}, 0);

		System.assertEquals(2, resultList.size());

	}

	/**
	 * getMaster2Records : test query limit.
	 */
	@isTest
	private static void getMaster2RecordsTest3() {
		List<Account> accounts = new List<Account> ();
		for (Integer i = 0; i<30; i++) {
			Account acct = new Account(Name = 'TestAccount' + i, Description = 'Description' + i);
			accounts.add(acct);
		}
		insert accounts;

		List<SObject> resultList = JunctionObjectHelper.getMaster2Records('Account', 'Name', new List<String> {
			'Name', 'Description'
		}, 0);

		System.assertEquals(20, resultList.size());

	}

	//---------------------------------------------getFilteredMaster2Records()-----------------------------------------------

	/**
	 *  getFilteredMaster2Records : No record contains the search term.
	 */
	@isTest
	private static void getFilteredMaster2Records1() {
		List<Account> accounts = new List<Account> ();
		Account acct1 = new Account(Name = 'TestAccount1', Description = 'Description1');
		accounts.add(acct1);
		Account acct2 = new Account(Name = 'TestAccount2', Description = 'Description2');
		accounts.add(acct2);
		insert accounts;
		List<SObject> resultList = JunctionObjectHelper.getFilteredMaster2Records('DoesNotExit', 'Account', 'Name', new List<String> {
			'Name', 'Description'
		});
		System.assertEquals(0, resultList.size());
	}

	/**
	 *  getFilteredMaster2Records : the records contain the search term.
	 */
	@isTest
	private static void getFilteredMaster2Records2() {
		List<Account> acctest = new List<Account> ();
		Account acct1 = new Account(Name = 'test Account1', Description = 'Description1');
		acctest.add(acct1);
		Account acct2 = new Account(Name = 'Account2', Description = 'Description2');
		acctest.add(acct2);
		insert acctest;

		Test.setFixedSearchResults(new List<Id> {
			acct1.Id
		});
		List<SObject> resultList = JunctionObjectHelper.getFilteredMaster2Records('test', 'Account', 'Name', new List<String> {
			'Name', 'Description'
		});

		System.assertEquals(1, resultList.size());
	}

	/**
	 * getFilteredMaster2Records : master's Object doesn't exist.
	 */
	@isTest
	private static void getFilteredMaster2Records4() {
		try {
			JunctionObjectHelper.getFilteredMaster2Records('Test', 'DoesNotExit', 'DoesNotExit', new List<String> {
				'Name'
			});
			System.assert(false);
		} catch (Exception e) {
			System.assert(true);
		}
	}

	//---------------------------------------------getJunctionRecords()-----------------------------------------------

	/**
	 * getJunctionRecords : test with bad params
	 */
	@isTest
	private static void getJunctionRecordsTest1() {
		try {
			Map<String, String> junctionObjectInfos = new Map<String, String> {
				'master1Id' => 'fakeId', 'master1FieldName' => 'fakeField', 'junctionObjectName' => 'fakeObject', 'master2RelationshipName' => 'fakeRelation'
			};
			List<SObject> resultList = JunctionObjectHelper.getJunctionRecords(junctionObjectInfos, new List<String> {
				'Quantity'
			}, 0);
			System.assert(false);
		} catch (Exception e) {
			System.assert(true);
		}
	}

	/**
	 * getJunctionRecords : query test Opportunity on the OpportunityLineItem junction object
	 */
	@isTest
	private static void getJunctionRecordsTest2() {
		Id standardPricebookId = Test.getStandardPricebookId();

		// create Product
		Product2 prdt = new Product2(Name = 'TEST Product', IsActive = true);
		insert prdt;

		// create PricebookEntry
		PricebookEntry pbEntry = new PricebookEntry(Pricebook2Id = standardPricebookId, Product2Id = prdt.Id, IsActive = true, UnitPrice = 1);
		insert pbEntry;

		// create Opportunity
		Opportunity opp = new Opportunity(name = 'TEST Opportunity', StageName = 'Qualification', Amount = 1000, CloseDate = Date.today(), Pricebook2Id = standardPricebookId);
		insert opp;

		// create OpportunityLineItem
		OpportunityLineItem oppLItem = new OpportunityLineItem(OpportunityId = opp.Id, Product2Id = prdt.Id, Quantity = 1, TotalPrice = 1);
		insert oppLItem;

		Map<String, String> junctionObjectInfos = new Map<String, String> {
			'master1Id' => opp.Id, 'master1FieldName' => 'OpportunityId', 'junctionObjectName' => 'OpportunityLineItem', 'master2RelationshipName' => 'Opportunity'
		};
		List<SObject> resultList = JunctionObjectHelper.getJunctionRecords(junctionObjectInfos, new List<String> {
			'Quantity'
		}, 0);
		System.assertEquals(1, resultList.size());
		System.assertEquals(1, ((OpportunityLineItem) resultList.get(0)).Quantity);
	}

	/**
	 * getJunctionRecords : query test Product on the OpportunityLineItem junction object
	 */
	@isTest
	private static void getJunctionRecordsTest3() {
		Id standardPricebookId = Test.getStandardPricebookId();

		// create Product
		Product2 prdt = new Product2(Name = 'TEST Product', IsActive = true);
		insert prdt;

		// create PricebookEntry
		PricebookEntry pbEntry = new PricebookEntry(Pricebook2Id = standardPricebookId, Product2Id = prdt.Id, IsActive = true, UnitPrice = 1);
		insert pbEntry;

		// create Opportunity
		Opportunity opp = new Opportunity(name = 'TEST Opportunity', StageName = 'Qualification', Amount = 1000, CloseDate = Date.today(), Pricebook2Id = standardPricebookId);
		insert opp;

		// create OpportunityLineItem
		OpportunityLineItem oppLItem = new OpportunityLineItem(OpportunityId = opp.Id, Product2Id = prdt.Id, Quantity = 1, TotalPrice = 1);
		insert oppLItem;

		Map<String, String> junctionObjectInfos = new Map<String, String> {
			'master1Id' => prdt.Id, 'master1FieldName' => 'Product2Id', 'junctionObjectName' => 'OpportunityLineItem', 'master2RelationshipName' => 'Product2'
		};
		List<SObject> resultList = JunctionObjectHelper.getJunctionRecords(junctionObjectInfos, new List<String> {
			'Quantity'
		}, 0);
		System.assertEquals(1, resultList.size());
		System.assertEquals(1, ((OpportunityLineItem) resultList.get(0)).Quantity);
	}

	//---------------------------------------------listJunctionObjects()-----------------------------------------------

	/**
	 * listJunctionObjects : query get OpportunityLineItem
	 */
	@isTest
	private static void listJunctionObjectsTest1() {
		List<JunctionObjectHelper.JunctionObjectDetail > resultList = JunctionObjectHelper.listJunctionObjects();
		System.assertEquals(1, resultList.size());
	}

	//---------------------------------------------createJunctionRecords()-----------------------------------------------

	/**
	 * listJunctionObjects : create DoesNotExit with no records input
	 */
	@isTest
	private static void createJunctionRecordsTest1() {
		try {
			String result = JunctionObjectHelper.createJunctionRecords('DoesNotExit', new List<Map<String, Object>> ());
			System.assert(false);
		} catch (Exception e) {
			System.assert(true);
		}
	}

	/**
	 * listJunctionObjects : create DoesNotExit with a record input
	 */
	@isTest
	private static void createJunctionRecordsTest2() {
		try {
			String result = JunctionObjectHelper.createJunctionRecords('DoesNotExit', new List<Map<String, Object>> {
				new Map<String, Object> {
					'DoesNotExit' => 'value'
				}
			});
			System.assert(false);
		} catch (Exception e) {
			System.assert(true);
		}
	}

	/**
	 * listJunctionObjects : create a junction object OpportunityLineItem
	 */
	@isTest
	private static void createJunctionRecordsTest3() {
		Id standardPricebookId = Test.getStandardPricebookId();

		// create Product
		Product2 prdt = new Product2(Name = 'TEST Product', IsActive = true);
		insert prdt;

		// create PricebookEntry
		PricebookEntry pbEntry = new PricebookEntry(Pricebook2Id = standardPricebookId, Product2Id = prdt.Id, IsActive = true, UnitPrice = 1);
		insert pbEntry;

		// create Opportunity
		Opportunity opp = new Opportunity(name = 'TEST Opportunity', StageName = 'Qualification', Amount = 1000, CloseDate = Date.today(), Pricebook2Id = standardPricebookId);
		insert opp;

		String result = JunctionObjectHelper.createJunctionRecords('OpportunityLineItem', new List<Map<String, Object>> {
			new Map<String, Object> {
				'OpportunityId' => opp.Id,
				'Product2Id' => prdt.Id,
				'Quantity' => 1,
				'TotalPrice' => 1
			}
		});

		List<OpportunityLineItem> oppLItems = [select OpportunityId, Product2Id from OpportunityLineItem];

		System.assertEquals('success', result);
		System.assertEquals(1, oppLItems.size());
		System.assertEquals(opp.Id, oppLItems.get(0).OpportunityId);
		System.assertEquals(prdt.Id, oppLItems.get(0).Product2Id);

	}

	//---------------------------------------------editJunctionRecords()-----------------------------------------------

	/**
	 * editJunctionRecords : edit DoesNotExit with no records input
	 */
	@isTest
	private static void editJunctionRecordsTest1() {
		try {
			String result = JunctionObjectHelper.editJunctionRecords('DoesNotExit', new List<Map<String, Object>> (), new List<Id> ());
			System.assert(false);
		} catch (Exception e) {
			System.assert(true);
		}
	}

	/**
	 *editJunctionRecords : edit DoesNotExit with a record input to edit
	 */
	@isTest
	private static void editJunctionRecordsTest2() {
		try {
			String result = JunctionObjectHelper.editJunctionRecords('DoesNotExit', new List<Map<String, Object>> {
				new Map<String, Object> {
					'DoesNotExit' => 'value'
				}
			}, new List<Id> ());
			System.assert(false);
		} catch (Exception e) {
			System.assert(true);
		}
	}

	/**
	 * editJunctionRecords : edit a junction object OpportunityLineItem
	 */
	@isTest
	private static void editJunctionRecordsTest3() {
		Id standardPricebookId = Test.getStandardPricebookId();

		// create Product
		Product2 prdt = new Product2(Name = 'TEST Product', IsActive = true);
		insert prdt;

		// create PricebookEntry
		PricebookEntry pbEntry = new PricebookEntry(Pricebook2Id = standardPricebookId, Product2Id = prdt.Id, IsActive = true, UnitPrice = 1);
		insert pbEntry;

		// create Opportunity
		Opportunity opp = new Opportunity(name = 'TEST Opportunity', StageName = 'Qualification', Amount = 1000, CloseDate = Date.today(), Pricebook2Id = standardPricebookId);
		insert opp;

		// create OpportunityLineItem
		OpportunityLineItem oppLItem = new OpportunityLineItem(OpportunityId = opp.Id, Product2Id = prdt.Id, Quantity = 1, TotalPrice = 1);
		insert oppLItem;

		String result = JunctionObjectHelper.editJunctionRecords('OpportunityLineItem', new List<Map<String, Object>> {
				new Map<String, Object> {
					'Id' => oppLItem.Id,
					'Quantity' => 100
				}
			},
			new List<Id> ()
		);

		List<OpportunityLineItem> oppLItems = [select Quantity from OpportunityLineItem];

		System.assertEquals('success', result);
		System.assertEquals(1, oppLItems.size());
		System.assertEquals(100, oppLItems.get(0).Quantity);
	}

	/**
	 * editJunctionRecords : delete a junction object OpportunityLineItem
	 */
	@isTest
	private static void editJunctionRecordsTest4() {
		Id standardPricebookId = Test.getStandardPricebookId();

		// create Product
		Product2 prdt = new Product2(Name = 'TEST Product', IsActive = true);
		insert prdt;

		// create PricebookEntry
		PricebookEntry pbEntry = new PricebookEntry(Pricebook2Id = standardPricebookId, Product2Id = prdt.Id, IsActive = true, UnitPrice = 1);
		insert pbEntry;

		// create Opportunity
		Opportunity opp = new Opportunity(name = 'TEST Opportunity', StageName = 'Qualification', Amount = 1000, CloseDate = Date.today(), Pricebook2Id = standardPricebookId);
		insert opp;

		// create OpportunityLineItem
		OpportunityLineItem oppLItem = new OpportunityLineItem(OpportunityId = opp.Id, Product2Id = prdt.Id, Quantity = 1, TotalPrice = 1);
		insert oppLItem;

		String result = JunctionObjectHelper.editJunctionRecords('OpportunityLineItem', new List<Map<String, Object>> (), new List<Id> {
			oppLItem.Id
		});

		List<OpportunityLineItem> oppLItems = [select Id from OpportunityLineItem];

		System.assertEquals('success', result);
		System.assertEquals(0, oppLItems.size());
	}

	//---------------------------------------------getJunctionObjectDetail()-------------------------------------------------------

	/**
	 * getJunctionObjectDetail : test with non junction object
	 */
	@isTest
	private static void getJunctionObjectDetailTest1() {
		Account acct = new Account(Name = 'TestAccount', Description = 'Description');
		insert acct;
		try {
			JunctionObjectHelper.JunctionObjectDetail result = JunctionObjectHelper.getJunctionObjectDetail(acct.Id, 'Contact');
			System.assert(false);
		} catch (Exception e) {
			System.assert(true);
		}
	}

	/**
	 * getJunctionObjectDetail : query a junction object OpportunityLineItem 
	 */
	@isTest
	private static void getJunctionObjectDetailTest2() {
		Id standardPricebookId = Test.getStandardPricebookId();

		// create Product
		Product2 prdt = new Product2(Name = 'TEST Product', IsActive = true);
		insert prdt;

		// create PricebookEntry
		PricebookEntry pbEntry = new PricebookEntry(Pricebook2Id = standardPricebookId, Product2Id = prdt.Id, IsActive = true, UnitPrice = 1);
		insert pbEntry;

		// create Opportunity
		Opportunity opp = new Opportunity(name = 'TEST Opportunity', StageName = 'Qualification', Amount = 1000, CloseDate = Date.today(), Pricebook2Id = standardPricebookId);
		insert opp;

		// create OpportunityLineItem
		OpportunityLineItem oppLItem = new OpportunityLineItem(OpportunityId = opp.Id, Product2Id = prdt.Id, Quantity = 1, TotalPrice = 1);
		insert oppLItem;

		JunctionObjectHelper.JunctionObjectDetail result = JunctionObjectHelper.getJunctionObjectDetail(opp.Id, 'OpportunityLineItem');
		System.assert(true);
	}

	// ======================================================================================
	// =============================== Private methods tests ================================
	// ======================================================================================

	//---------------------------------------------getObjectNameDurableIdMap()-------------------------------------------------------

	/**
	 *  getObjectNameDurableIdMap : test with empty name list
	 */
	@isTest
	private static void getObjectNameDurableIdMapTest1() {

		Map<String, String> resultMap = JunctionObjectHelper.getObjectNameDurableIdMap(new List<String> ());

		System.assertEquals(0, resultMap.keySet().size());
	}

	/**
	 *  getObjectNameDurableIdMap : test with name list that contains Account
	 */
	@isTest
	private static void getObjectNameDurableIdMapTest2() {

		Map<String, String> resultMap = JunctionObjectHelper.getObjectNameDurableIdMap(new List<String> {
			'Account'
		});

		System.assertEquals(1, resultMap.keySet().size());
		System.assertEquals('Account', resultMap.get('Account'));
	}

	/**
	 *  getObjectNameDurableIdMap : test with name list that contains Account and Contact
	 */
	@isTest
	private static void getObjectNameDurableIdMapTest3() {

		Map<String, String> resultMap = JunctionObjectHelper.getObjectNameDurableIdMap(new List<String> {
			'Account', 'Contact'
		});

		System.assertEquals(2, resultMap.keySet().size());
		System.assertEquals('Account', resultMap.get('Account'));
		System.assertEquals('Contact', resultMap.get('Contact'));
	}

	//---------------------------------------------getMasterObjectDetail()-------------------------------------------------------

	/**
	 *  getMasterObjectDetail : test with AccountId on Contact
	 */
	@isTest
	private static void getMasterObjectDetailTest1() {

		JunctionObjectHelper.MasterObjectDetail result = JunctionObjectHelper.getMasterObjectDetail(Contact.SObjectType.getDescribe(), Contact.AccountId.getDescribe());

		System.assertEquals('Contact', result.name);
		System.assertEquals('AccountId', result.fieldName);
		System.assertEquals('Account', result.relationshipName);
	}

	//---------------------------------------------getNameFieldDetail()-------------------------------------------------------

	/**
	 *  getNameFieldDetail : test with Account
	 */
	@isTest
	private static void getNameFieldDetailTest1() {

		Map<String, String> resultMap = JunctionObjectHelper.getNameFieldDetail(Account.SObjectType.getDescribe());

		System.assertEquals('Name', resultMap.get('nameField'));
	}

	/**
	 *  getNameFieldDetail : test with Contact
	 */
	@isTest
	private static void getNameFieldDetailTest2() {

		Map<String, String> resultMap = JunctionObjectHelper.getNameFieldDetail(Contact.SObjectType.getDescribe());

		System.assertEquals('Name', resultMap.get('nameField'));
	}
}