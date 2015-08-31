## Steel
Javascript GridView library. Supporting obtaining data from server (ajax requests) or from standalone data. Supports editing / sorting / column wide customizing.

## Features
* Data obtained from any of *data providers*. They can load data from server, static arrays, etc. 
* Paging
* Sorting
* Insert / edit / delete records.
* Customizible render of rows, cells, etc.
* Support of edit of variuos types of data: listbox, date, ordinary string (complete list in <code>Steel__ENUM_CELL_EDITOR_TYPE</code>); or implement custom editor (only need to implement 2 functions)
* TODO: filters
* TODO: column resizing with mouse

## Data providers
<code>Steel__Grid</code> can obtain data from diferent types of sources: request data from server (<code>Steel__DataProviderAjax</code>) or static javascript arrays (<code>Steel__DataProviderStatic</code>)

To obtain data (or to push data changes) grid generating *requests* and send it to *data provider*. Then *data provider* doing actual work with data and returning *responces* back to grid.
Types of *requests*: fetch data, insert record, update, delete (types listed at <code>Steel__ENUM_PACKET_REQUEST_OPERATION</code>):
See [test_ajax.php](https://github.com/sharpensteel/Steel/tree/master/tests/test_ajax.php) how to implement **server backend** of <code>Steel__DataProviderAjax</code> 


## Requirements:


jQuery library (tested on v1.11+)


Library written in JavaScript ES6. Support in Chrome only, for other browsers you should use js compilers/polyfills. In [samples](https://github.com/sharpensteel/Steel/tree/master/tests) used compiler [babel](https://babeljs.io/)


Number of HTML5 features used:
* \<input type='date'\> - (currently Chrome only support)
* \<input type='color'\> - (currently no IE support)
* \<input type='datetime-local'\> - (currently Chrome only support)
You need use polyfills if you intend to use those features

 


