import 'devextreme/dist/css/dx.common.css';
import './themes/generated/theme.base.css';
import './themes/generated/theme.additional.css';
import React, { useRef, useState } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import './dx-styles.scss';
import { DataGrid } from 'devextreme-react';
import { Sorting, Selection, Column } from 'devextreme-react/data-grid';
import data from './api/data';
import GroupTemplate from './api/group-template';

function App() {

  const [fields] = useState(data);
  const [groupedData, setGroupedData] = useState([])
  const [keyExpr] = useState("ProductID")
  const grid = useRef(null);

  const groups = ["Category.CategoryName", "GroupCode"]


  const getKeys = function (
    data,
    keys,
    groupedColumnName,
    groupKey,
    keyFieldName
  ) {
    let groupRow = data.find((i) => {
      return i.key === groupKey;
    });
    if (groupRow) keys = groupRow.items.map((i) => i[keyFieldName]);
    return keys;
  };


  const getParent = () => {

  };

  const getChildren = (keys, groupKey, keyFieldName) => {
    let groupRow = data.find((i) => {
      return i.key === groupKey;
    });

    if (groupRow) {
      keys = [...keys, groupRow.items.map((i) => i[keyFieldName])]
      if (groupRow.items !== undefined) {
        groupRow.items.foreach(x => {
          let keyFieldName = x.key ? "key" : "GroupCode";
          x.remember += x.remember + x.key;
          console.log("TOREMEBERRRRRRR")
          keys = [...keys, getChildren(keys, x.key, keyFieldName)]
        })

      }
    }
    //if (groupRow) keys = groupRow.items.map((i) => i[keyFieldName]);


    return keys;
  }


  const getGroupedKeys = (keys, groupKey, keyFieldName) => {
    groups.foreach(group => {
      var subgroups = group.split(".");
      subgroups.foreach(subgroup => {
        keys.fiter(key => key)
      })

    })
    return keys;
  }




  const removeIrrelevantChildren = (keys, groupKey) => {

  }
  const getGroupedColumns = () => {
    let colNames = [],
      groupedColumns = [],
      groupIndex = null;

    for (let i = 0; i < grid.columnCount(); i++) {
      groupIndex = grid.columnOption(i, "groupIndex")
      if (groupIndex > -1) {
        groupedColumns.push({
          dataField: grid.columnOption(i, "dataField"),
          groupIndex
        });
      }
    }

    groupedColumns.sort((a, b) => (a.groupIndex > b.groupIndex) ? 1 : -1)
    groupedColumns.forEach(col => {
      colNames.push(col.dataField);
    })
    return colNames;
  }

  const checkIfKeysAreSelected = function (currentKeys, selectedKeys) {
    let count = 0;

    if (selectedKeys.length === 0) return false;
    for (var i = 0; i < currentKeys.length; i++) {
      var keyValue = currentKeys[i];
      if (selectedKeys.indexOf(keyValue) > -1)
        // key is not selected
        count++;
    }
    if (count === 0) return false;
    if (currentKeys.length === count) return true;
    else return undefined;
  };

  const getCountOfItems = (topItem) => {
    let count = 0;
    if (topItem.items) {

      for (var o = 0; o < topItem.items.length; o++) {
        count += getCountOfItems(topItem.items[o])
      }

    }
    if (topItem.length) {
      count += topItem.length;
    } else {
      if (!topItem.key)
        count++;
    }

    return count;
  }

  const checkIfChildrenAreSelected = (currentKeys, selectedKeys) => {
    let count = 0;
    if (!currentKeys) { return true; }
    if (selectedKeys.length === 0) return false;

    count = isSelected(currentKeys, selectedKeys)

    let optCount = 0;
    if (currentKeys.items) {

      currentKeys.items.foreach(x => optCount += getCountOfItems(x))
    } else {
      for (var o = 0; o < currentKeys.length; o++) {
        optCount += getCountOfItems(currentKeys[o])
      }
    }

    if (count === 0) return false;
    if (optCount === count) return true;
    else return undefined;
  }

  const isSelected = (items, selectedKeys) => {
    var count = 0;
    if (!items) { return }
    if (items.items) {
      count += isSelected(items.items, selectedKeys);
    } else {
      for (var o = 0; o < items.length; o++) {
        var itemsOfGroupKey = items[o].items;
        if (itemsOfGroupKey) {
          count += isSelected(itemsOfGroupKey, selectedKeys)
        }
      }
    }
    for (var i = 0; i < items.length; i++) {
      var keyValue = items[i];
      if (selectedKeys.indexOf(keyValue.ProductID) > -1) {
        count++;
      }

    }
    return count;

  }

  const getGroupText = (
    column,
    text,
    groupContinuesMessage,
    groupContinuedMessage
  ) => {
    let groupText = "";
    groupText = column.caption + ": " + text;
    if (groupContinuedMessage && groupContinuesMessage) {
      groupText +=
        " (" + groupContinuedMessage + ". " + groupContinuesMessage + ")";
    } else if (groupContinuesMessage) {
      groupText += " (" + groupContinuesMessage + ")";
    } else if (groupContinuedMessage) {
      groupText += " (" + groupContinuedMessage + ")";
    }
    return groupText;
  };

  const onSelectionChanged = (args) => {
    let keys = groupedData.slice();
    setGroupedData(keys);
  };

  const getAllItems = (data) => {
    let keys = data.items;
    if (data.collapsedItems) {
      if (!keys) {
        keys = [...data.collapsedItems];
      } else {
        keys = [...data.items, ...data.collapsedItems];
      }

    }
    return keys;
  }

  const renderer = (props) => {
    let {
      column,
      value,
      groupContinuedMessage,
      groupContinuesMessage,
      text,
      component
    } = props;

    let keys = getAllItems(props.data)
    //if(props.data)
    //console.log("keys", keys);
    console.log("selected", component.getSelectedRowKeys())
    let checked = checkIfChildrenAreSelected(keys, component.getSelectedRowKeys(), value, keyExpr);
    let groupText = getGroupText(
      column,
      text,
      groupContinuesMessage,
      groupContinuedMessage
    );
    props = {
      checked: checked,
      groupText: groupText,
      onValueChanged: (args) => {
        onValueChanged(args, component, keys);
      }
    };
    return <GroupTemplate {...props} />;
  };
/*

  if (topItem.length) {
    count += topItem.length;
  } else {
    if (!topItem.key)
      count++;
  }
*/

  const recursiveSelect = (topItem) => {
    if (topItem.items) {
      //select items
      grid.selectRows(topItem.items.filter(x => x.ProductID !== undefined).map(x => x.ProductID), true);

      for (var o = 0; o < topItem.items.length; o++) {
        recursiveSelect(topItem.items[o])
      }

    }else if (topItem.ProductID){
      grid.selectRows([topItem.ProductID],true);
    }else if(topItem.length){
      for (var o = 0; o < topItem.length; o++) {
        recursiveSelect(topItem[o])
      }
    }
    return;
  }


  const onValueChanged = (args, grid, keys) => {
    if (args.event === undefined) {
      return;
    }
    if (args.value) {
      if(keys.length){
        for (var o = 0; o < keys.length; o++) {
          recursiveSelect(keys[o])
        }

      }else{
        recursiveSelect(keys);
      }
    }
    else { grid.deselectRows(keys.map(x => x.ProductID ? x.ProductID : x.key)); }
    onSelectionChanged();
  };



  const onContentReady = (args) => {
    if (args.component.isNotFirstLoad) return;
    args.component.isNotFirstLoad = true;
    let ds = args.component.getDataSource();
    ds.store()
      .load(ds.loadOptions())
      .done((r) => {
        setGroupedData(r)
      });
  };



  return (<div>
    <DataGrid ref={grid} onSelectionChanged={onSelectionChanged} onContentReady={onContentReady} keyExpr={keyExpr} columnAutoWidth dataSource={fields} width="100%" height="100%" paging={{ enabled: false }}>
      <Selection mode="multiple" showCheckBoxesMode="always"></Selection>
      <Sorting mode="multiple"></Sorting>
      <Column dataField='ProductID' />
      <Column dataField='ProductName' />
      <Column dataField='Category.CategoryName' groupIndex="0" groupCellRender={renderer} />
      <Column dataField='GroupCode' groupIndex="1" groupCellRender={renderer} />
      <Column dataField='ThirdGroup' groupIndex="2" groupCellRender={renderer} />
    </DataGrid>

  </div>);
}

export default function Root() {

  return (
    <Router>
      <App />
    </Router>
  );
}
