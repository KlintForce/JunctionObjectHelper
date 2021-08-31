/**
 * Junction Object Helper
 * @author efrontech
 */
public with sharing class JunctionObjectHelper {

	// junction object detail
	public class JunctionObjectDetail {
		@AuraEnabled
		public MasterObjectDetail master1;
		@AuraEnabled
		public MasterObjectDetail master2;
		@AuraEnabled
		public String durableId;
		@AuraEnabled
		public String name;
		@AuraEnabled
		public String label;
		@AuraEnabled
		public String labelPlural;
	}

	// master object detail
	public class MasterObjectDetail {
		@AuraEnabled
		public String durableId;
		@AuraEnabled
		public String name;
		@AuraEnabled
		public String label;
		@AuraEnabled
		public String labelPlural;
		@AuraEnabled
		public String nameField;
		@AuraEnabled
		public String nameFieldLabel;
		@AuraEnabled
		public String fieldName;
		@AuraEnabled
		public String fieldLabel;
		@AuraEnabled
		public String relationshipName;
	}

	// query limit
	private static final Integer QUERY_LIMIT = 20;

	/**
	 * get master 2 object records
	 * @param master2Name master 2 object name
	 * @param master2NameField master 2 name field
	 * @param fields list of fields
	 * @param offset query offset
	 * @returns `List<SObject>` list of master 2 object records
	 * @exception AuraHandledException
	 */
	@AuraEnabled
	public static List<SObject> getMaster2Records(String master2Name, String master2NameField, List<String> fields, Integer offset) {
		try {
			String strquery = 'SELECT ' + String.escapeSingleQuotes(String.join(fields, ',')) +
				' FROM ' + String.escapeSingleQuotes(master2Name) +
				' WITH SECURITY_ENFORCED' +
				' ORDER BY ' + String.escapeSingleQuotes(master2NameField) +
				' LIMIT ' + QUERY_LIMIT +
				' OFFSET ' + offset;
			List<sObject> sobjList = database.query(strquery);
			return sobjList;
		} catch (Exception e) {
			debugLogException(e);
			throw new AuraHandledException('Server error while getting master 2 records');
		}
	}

	/**
	 * get filtered records of the master 2 object
	 * @param searchTerm search term
	 * @param master2Name master 2 object name
	 * @param fields list of fields
	 * @returns `List<SObject>` list of filtered records
	 * @exception AuraHandledException
	 */
	@AuraEnabled(cacheable = true)
	public static List<SObject> getFilteredMaster2Records(String searchTerm, String master2Name, String master2NameField, List<String> fields) {
		try {
			String searchquery = 'FIND \'' + String.escapeSingleQuotes(searchTerm) + '*\' IN ALL FIELDS ' +
				' RETURNING ' + String.escapeSingleQuotes(master2Name) + 
				'(' + String.escapeSingleQuotes(String.join(fields, ',')) + ' ORDER BY ' + String.escapeSingleQuotes(master2NameField) + ')' +
				' LIMIT ' + QUERY_LIMIT;
			List<List<SObject>> searchList = search.query(searchquery);
			return searchList.get(0);
		} catch (Exception e) {
			debugLogException(e);
			throw new AuraHandledException('Server error while getting filtered master 2 records');
		}
	}

	/**
	 * get junction object records
	 * @param junctionInfos junction object infos
	 * @param fields list of fields
	 * @param offset query offset
	 * @returns `List<SObject>` list of junction object records
	 * @exception AuraHandledException
	 */
	@AuraEnabled
	public static List<SObject> getJunctionRecords(Map<String, String> junctionInfos, List<String> fields, Integer offset) {
		try {
			String master1Id = junctionInfos.get('master1Id');
			String master1FieldName = junctionInfos.get('master1FieldName');
			String junctionObjectName = junctionInfos.get('junctionObjectName');
			String master2RelationshipName = junctionInfos.get('master2RelationshipName');

			String strquery = 'SELECT ' + String.escapeSingleQuotes(master2RelationshipName) + '.Name,' + String.escapeSingleQuotes(String.join(fields, ',')) +
				' FROM ' + String.escapeSingleQuotes(junctionObjectName) +
				' WHERE ' + String.escapeSingleQuotes(master1FieldName) + ' = :master1Id' +
				' WITH SECURITY_ENFORCED' +
				' ORDER BY Name' +
				' LIMIT ' + QUERY_LIMIT +
				' OFFSET ' + offset;
			List<sObject> sobjList = database.query(strquery);
			return sobjList;
		} catch (Exception e) {
			debugLogException(e);
			throw new AuraHandledException('Server error while getting junction object records');
		}
	}

	/**
	 * create junction records
	 * @param junctionObjectName junction object name
	 * @param junctionObjectCreatedRecords list of junction object records created
	 * @returns `String` status
	 * @exception AuraHandledException
	 */
	@AuraEnabled
	public static String createJunctionRecords(String junctionObjectName, List<Map<String, Object>> junctionObjectCreatedRecords) {
		Schema.SObjectType junctionObjectType = Schema.getGlobalDescribe().get(junctionObjectName); 
		try {
			if(junctionObjectType.getDescribe().isCreateable()){
				Map<String, Schema.SObjectField> fieldTokensMap = junctionObjectType.getDescribe(SObjectDescribeOptions.DEFERRED).fields.getMap();
				List<SObject> junctionSObjectList = new List<SObject> ();
				// create junction objects
				for (Map<String, Object> junctionRecord: junctionObjectCreatedRecords) {
					// instanciate junction object
					SObject sObj = Schema.getGlobalDescribe().get(junctionObjectName).newSObject();

					for (String fieldName: junctionRecord.keySet()) {
						if(fieldTokensMap.get(fieldName).getDescribe().isCreateable()){
							sObj.put(fieldName, junctionRecord.get(fieldName));
						}else {
							throw new SObjectAccessException();
						}
					}
					junctionSObjectList.add(sObj);
				}

				insert junctionSObjectList;
				return 'success';
			}else {
				throw new SObjectAccessException();
			}
		} catch (Exception e) {
			debugLogException(e);
			throw new AuraHandledException('Server error while creating junction object records');
		}
	}

	/**
	 * edit junction records
	 * @param junctionObjectName junction object name
	 * @param junctionObjectEditedRecords list of junction object records edited
	 * @param junctionObjectDeletedRecords list of junction object records deleted
	 * @returns `String` status
	 * @exception AuraHandledException
	 */
	@AuraEnabled
	public static String editJunctionRecords(String junctionObjectName, List<Map<String, Object>> junctionObjectEditedRecords, List<Id> junctionObjectDeletedRecords) {
		Schema.SObjectType junctionObjectType = Schema.getGlobalDescribe().get(junctionObjectName); 
		try {
			if(junctionObjectType.getDescribe().isDeletable()){
				// delete records
				Database.delete(junctionObjectDeletedRecords);
			}

			if(junctionObjectType.getDescribe().isUpdateable()){
				Map<String, Schema.SObjectField> fieldTokensMap = junctionObjectType.getDescribe(SObjectDescribeOptions.DEFERRED).fields.getMap();
				List<SObject> junctionSObjectList = new List<SObject> ();
				// update junction objects
				for (Map<String, Object> junctionRecord: junctionObjectEditedRecords) {
					// instanciate junction object
					SObject sObj = Schema.getGlobalDescribe().get(junctionObjectName).newSObject();

					// set record id
					sObj.put('Id', junctionRecord.get('Id')); 
					junctionRecord.remove('Id');

					for (String fieldName: junctionRecord.keySet()) {
						if(fieldTokensMap.get(fieldName).getDescribe().isUpdateable()){
							sObj.put(fieldName, junctionRecord.get(fieldName));
						}
					}
					junctionSObjectList.add(sObj);
				}

				update junctionSObjectList;
			}else {
				throw new SObjectAccessException();
			}
			return 'success';
		} catch (Exception e) {
			debugLogException(e);
			throw new AuraHandledException('Server error while editing junction object records');
		}
	}

	/**
	 * get junction object detail
	 * @param master1Id id of the master 1 record
	 * @param junctionObjectName junction object name
	 * @returns `JunctionObjectDetail` detail about the junction object
	 * @exception AuraHandledException
	 */
	@AuraEnabled(cacheable = true)
	public static JunctionObjectDetail getJunctionObjectDetail(Id master1Id, String junctionObjectName) {
		try {

			// instanciate wrappers
			JunctionObjectDetail info = new JunctionObjectDetail();
			MasterObjectDetail master1 = new MasterObjectDetail();
			MasterObjectDetail master2 = new MasterObjectDetail();

			Schema.DescribeSObjectResult junctionObjectDescribe;
			Schema.DescribeSObjectResult master1Describe = master1Id.getSObjectType().getDescribe();
			Integer master1RelationshipOrder;

			// detect the master 1 object 
			for (Schema.ChildRelationship relationship: master1Describe.getChildRelationships()) {
				Schema.DescribeFieldResult field1Describe = relationship.getField().getDescribe();
				// condition for testing with the standard junction object OpportunityLineItem
				Boolean isTest = Test.isRunningTest() && master1Describe.getName() == 'Opportunity' && field1Describe.getName() == 'OpportunityId';
				if (field1Describe.getRelationshipOrder() != null || isTest) {
					junctionObjectDescribe = relationship.getChildSObject().getDescribe();
					if (junctionObjectDescribe.getName().equalsIgnoreCase(junctionObjectName)) {
						info.name = junctionObjectDescribe.getName();
						info.label = junctionObjectDescribe.getLabel();
						info.labelPlural = junctionObjectDescribe.getLabelPlural();
						master1 = getMasterObjectDetail(master1Describe, field1Describe);
						master1RelationshipOrder = field1Describe.getRelationshipOrder();
						break;
					}
				}
			}

			if (info.name == null) {
				throw new AuraHandledException('Server error : not a junction object');
			}

			Schema.DescribeSObjectResult master2Describe;
			// detect the master 2 object
			for (Schema.SObjectField field: junctionObjectDescribe.fields.getMap().values()) {
				Schema.DescribeFieldResult field2Describe = field.getDescribe();
				// condition for testing with the standard junction object OpportunityLineItem
				Boolean isTest = Test.isRunningTest() && field2Describe.getName() == 'Product2Id';
				if ((field2Describe.getRelationshipOrder() != null & field2Describe.getRelationshipOrder() != master1RelationshipOrder) || isTest) {
					master2Describe = field2Describe.getReferenceTo().get(0).getDescribe();
					master2 = getMasterObjectDetail(master2Describe, field2Describe);
					break;
				}
			}

			if (master2.name == null) {
				throw new AuraHandledException('Server error : not a junction object');
			}

			info.master1 = master1;
			info.master2 = master2;

			return info;
		} catch (Exception e) {
			debugLogException(e);
			throw new AuraHandledException('Server error : not a junction object');
		}
	}

	/**
	 * detect & list the junction objects
	 * @returns `List<JunctionObjectDetail>` junction object details
	 * @exception AuraHandledException
	 */
	@AuraEnabled(cacheable = true)
	public static List<JunctionObjectDetail> listJunctionObjects() {
		try {
			Map<String, Schema.SObjectType > globalDescribe = Schema.getGlobalDescribe();
			List<JunctionObjectDetail> junctionObjectDetailList = new List<JunctionObjectDetail> ();
			List<String> junctionObjectNames = new List<String> ();
			List<String> master1ObjectNames = new List<String> ();
			List<String> master2ObjectNames = new List<String> ();
			for (Schema.SObjectType sObjType: globalDescribe.values()) {
				Schema.DescribeSObjectResult sObjDesc = sObjType.getDescribe();
				Boolean isTest = sObjDesc.getName() == 'OpportunityLineItem';
				if (sObjDesc.isCustom() || isTest) {
					JunctionObjectDetail junctionDetail = new JunctionObjectDetail();
					Map<String, Schema.DescribeFieldResult > masterDetailFieldMap = new Map<String, Schema.DescribeFieldResult > ();
					Integer nbMasterDetail = 0;
					for (Schema.SObjectField field: sObjDesc.fields.getMap().values()) {
						Schema.DescribeFieldResult fieldDesc = field.getDescribe();
						isTest = Test.isRunningTest() && sObjDesc.getName() == 'OpportunityLineItem' && (fieldDesc.getName() == 'OpportunityId' || fieldDesc.getName() == 'Product2Id');
						if (fieldDesc.getRelationshipOrder() != null || isTest) {
							masterDetailFieldMap.put(fieldDesc.getName(), fieldDesc);
							nbMasterDetail++;
							if (nbMasterDetail == 2) {
								break;
							}
						}
					}
					if (nbMasterDetail == 2) {
						List<String> masterDetailFieldList = new List<String> (masterDetailFieldMap.keySet());
						Schema.DescribeFieldResult masterDetail1FieldDesc = masterDetailFieldMap.get(masterDetailFieldList.get(0));
						Schema.DescribeSObjectResult master1ObjDesc = masterDetailFieldMap.get(masterDetailFieldList.get(0)).getReferenceTo().get(0).getDescribe();
						Schema.DescribeFieldResult masterDetail2FieldDesc = masterDetailFieldMap.get(masterDetailFieldList.get(1));
						Schema.DescribeSObjectResult master2ObjDesc = masterDetailFieldMap.get(masterDetailFieldList.get(1)).getReferenceTo().get(0).getDescribe();
						junctionDetail.name = sObjDesc.getName();
						junctionDetail.label = sObjDesc.getLabel();
						junctionDetail.labelPlural = sObjDesc.getLabelPlural();
						MasterObjectDetail master1 = getMasterObjectDetail(master1ObjDesc, masterDetail1FieldDesc);
						MasterObjectDetail master2 = getMasterObjectDetail(master2ObjDesc, masterDetail2FieldDesc);
						junctionDetail.master1 = master1;
						junctionDetail.master2 = master2;
						junctionObjectDetailList.add(junctionDetail);
						junctionObjectNames.add(junctionDetail.name);
						master1ObjectNames.add(master1.name);
						master2ObjectNames.add(master2.name);
					}
				}
			}
			Map<String, String> junctionDurableIdMap = getObjectNameDurableIdMap(junctionObjectNames);
			Map<String, String> master1DurableIdMap = getObjectNameDurableIdMap(master1ObjectNames);
			Map<String, String> master2DurableIdMap = getObjectNameDurableIdMap(master2ObjectNames);

			for (JunctionObjectDetail junctionDetail: junctionObjectDetailList) {
				junctionDetail.durableId = junctionDurableIdMap.get(junctionDetail.name);
				junctionDetail.master1.durableId = master1DurableIdMap.get(junctionDetail.master1.name);
				junctionDetail.master2.durableId = master2DurableIdMap.get(junctionDetail.master2.name);
			}
			return junctionObjectDetailList;
		} catch (Exception e) {
			debugLogException(e);
			throw new AuraHandledException('Server error while listing junction object details');
		}
	}

	// ======================================================================================
	// ================================= Private methods ====================================
	// ======================================================================================

	/**
	 * get a map of object names and durable ids from a list of object names
	 * @param objectNames list of object names
	 * @returns `Map<String,String>` map of object names and durable ids
	 */
	@testvisible
	private static Map<String, String> getObjectNameDurableIdMap(List<String> objectNames) {
		Map<String, String> nameDurableIdMap = new Map<String, String> ();
		List<EntityDefinition> edList = [SELECT QualifiedApiName, DurableId FROM EntityDefinition WHERE QualifiedApiName =: objectNames];
		for (EntityDefinition ed: edList) {
			nameDurableIdMap.put(ed.QualifiedApiName, ed.DurableId);
		}
		return nameDurableIdMap;
	}
	/**
	 * get master object detail
	 * @param masterDescribe master object describe
	 * @param fieldDescribe master detail field describe
	 * @returns `MasterObjectDetail` master detail
	 */
	@testvisible
	private static MasterObjectDetail getMasterObjectDetail(DescribeSObjectResult masterDescribe, Schema.DescribeFieldResult fieldDescribe) {
		MasterObjectDetail master = new MasterObjectDetail();
		master.fieldName = fieldDescribe.getName();
		master.fieldLabel = fieldDescribe.getLabel();
		master.relationshipName = fieldDescribe.getRelationshipName();
		master.name = masterDescribe.getName();
		master.label = masterDescribe.getLabel();
		master.labelPlural = masterDescribe.getLabelPlural();
		Map<String, String> masterNameFieldDetail = getNameFieldDetail(masterDescribe);
		master.nameField = masterNameFieldDetail.get('nameField');
		master.nameFieldLabel = masterNameFieldDetail.get('nameFieldLabel');
		return master;
	}

	/**
	 * get name field detail from an sObject describe
	 * @param objDescribe sObject describe
	 * @returns `Map<String, String>` detail about the name field
	 */
	@testvisible
	private static Map<String, String> getNameFieldDetail(DescribeSObjectResult objDescribe) {
		Map<String, SObjectField> fieldsMap = objDescribe.fields.getMap();
		for (SObjectField fieldToken: fieldsMap.values()) {
			DescribeFieldResult fieldDescribe = fieldToken.getDescribe();
			if (fieldDescribe.isNameField()) {
				return new Map<String, String> {
					'nameField' => fieldDescribe.getName(),
					'nameFieldLabel' => fieldDescribe.getLabel()
				};
			}
		}
		// default
		return new Map<String, String> {
			'nameField' => 'Name',
			'nameFieldLabel' => 'Name'
		};
	}

	/**
	 * debug log the thown exception
	 * @param e exception
	 */
	private static void debugLogException(Exception e){
		System.debug('======== Junction Object Helper error start ========');
		System.debug('Exception.getMesssage : '+ e.getMessage());
		System.debug('Exception.getStackTraceString : '+ e.getStackTraceString());
		System.debug('======== Junction Object Helper error end ========');
	}

	/**
	 * CRUD or FLS Exception
	 */
	public class SObjectAccessException extends Exception {}
}