import markupTypesJson from "app/common/resources/markupTypes.json";
import ranNamesJson from "app/common/resources/ranName.json";
import bandJson from "app/common/resources/band.json";
import stateJson from "app/common/resources/states.json";
import priorityJson from "app/common/resources/priority.json";
import dataFieldsJson from "app/common/resources/dataFields.json";
import cellTypesJson from "app/common/resources/cellTypes.json";
import cellPopupExceptFieldsJson from "app/common/resources/cellPopupExceptFields.json";
import cameraPopupExceptFieldsJson from "app/common/resources/btsPopupExceptFields.json";
import technologiesJson from "app/common/resources/technologies.json";
import technologyFiltersJson from "app/common/resources/technologyFilters.json";
import userRolesJson from "app/common/resources/userRoles.json";
import importDataStatusJson from "app/common/resources/importDataStatus.json";
import referenceTypesJson from "app/common/resources/referenceTypes.json";
import fields from "app/common/resources/fields.json";
import columnConversion from "app/common/resources/columnConversion.json";

/*@ngInject*/
export default class ResourceService {
  constructor($q,
              $http,
              appConstant) {
    this._$q = $q;
    this._$http = $http;
    this._appConstant = appConstant;

    this._ranNamesJson = ranNamesJson;
    this._bandJson = bandJson;
    this._statesJson = stateJson;
    this._priorityJson = priorityJson;
    this._dataFieldsJson = dataFieldsJson;
    this._cellTypesJson = cellTypesJson;
    this._cellPopupExceptFieldsJson = cellPopupExceptFieldsJson;
    this._cameraPopupExceptFieldsJson = cameraPopupExceptFieldsJson;
    this._technologiesJson = technologiesJson;
    this._technologyFiltersJson = technologyFiltersJson;
    this._importDataStatusJson = importDataStatusJson;
    this._markupTypesJson = markupTypesJson;
    this._columnConversion = columnConversion;
  }

  /**
   * getRanNames
   * @returns {Object|Array|string|number|*}
   */
  getRanNames() {
    return this._ranNamesJson;
  }


  /**
   * getBands
   * @returns {*}
   */
  getBands() {
    return this._bandJson;
  }

  /**
   * getStates
   * @returns {*}
   */
  getStates() {
    return this._statesJson;
  }

  /**
   * getPriorities
   * @returns {*}
   */
  getPriorities() {
    return this._priorityJson;
  }

  /**
   * getDataFields
   * @returns {*}
   */
  getDataFields() {
    return this._dataFieldsJson;
  }

  /**
   * getCellTypes
   * @returns {*}
   */
  getCellTypes() {
    return this._cellTypesJson;
  }

  /**
   * Array of cell fields that do not display to "cell popup"
   * See: app/main/resources/cellPopupExceptFields.json
   * @returns {*}
   */
  getCellPopupExceptFields() {
    return this._cellPopupExceptFieldsJson;
  }

  /**
   * Array of bts fields that do not display to "bts popup"
   * See: app/main/resources/btsPopupExceptFields.json
   * @returns {*}
   */
  getCameraPopupExceptFields() {
    return this._cameraPopupExceptFieldsJson;
  }

  /**
   * Config technologies: 2G, 3G, ...
   * See: app/main/resources/technologies.json
   *
   * @param ignoreLoadingBar
   * @returns {*}
   */
  getTechnologies(ignoreLoadingBar) {
    let self = this;
    let url = `${self._appConstant.domain}/api/${self._appConstant.apiVersion}/common/technology/${L.NETWORK.CONSTANT.operatorId}`;
    return self._$http.get(url, {
      ignoreLoadingBar: ignoreLoadingBar
    });
  }

  /**
   * Config technology Filter: 2G, 3G, ...
   * See: app/main/resources/technologyFilters.json
   * @returns {*}
   */
  getTechnologyFilters() {
    return this._technologyFiltersJson;
  }

  /**
   * Get import data status
   * @returns {Object|Array|string|number}
   */
  getImportDataStatus() {
    return angular.fromJson(importDataStatusJson);
  }

  /**
   * Get markup types
   * @returns {Object|Array|string|number}
   */
  getMarkupTypes() {
    let self = this;
    return self._markupTypesJson;
  }

  /**
   * Get user roles
   * @returns {Object|Array|string|number}
   */
  getUserRoles() {
    return angular.fromJson(userRolesJson);
  }

  /**
   * Get reference Types
   * @returns {Object|Array|string|number}
   */
  getReferenceTypes() {
    return angular.fromJson(referenceTypesJson);
  }

  getFields() {
    return angular.fromJson(fields);
  }

  getColumnConversion() {
    return angular.fromJson(columnConversion);
  }
}
