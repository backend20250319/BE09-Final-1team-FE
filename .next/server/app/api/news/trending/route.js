/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/news/trending/route";
exports.ids = ["app/api/news/trending/route"];
exports.modules = {

/***/ "(rsc)/./app/api/news/trending/route.js":
/*!****************************************!*\
  !*** ./app/api/news/trending/route.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n\nconst BASE = process.env.NEWS_BASE_URL || 'http://localhost:8082';\nasync function GET(req) {\n    try {\n        console.log('🔧 환경 변수 NEWS_BASE_URL:', process.env.NEWS_BASE_URL);\n        console.log('🔧 기본값 BASE:', BASE);\n        const { search } = new URL(req.url);\n        const url = `${BASE}/api/news/trending${search}`;\n        console.log('🔗 프록시 요청 URL:', url);\n        const resp = await fetch(url, {\n            headers: {\n                'Content-Type': 'application/json'\n            },\n            cache: 'no-store'\n        });\n        console.log('📡 응답 상태:', resp.status, resp.statusText);\n        if (!resp.ok) {\n            console.error('❌ API 응답 오류:', resp.status, resp.statusText);\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: `API 요청 실패: ${resp.status} ${resp.statusText}`\n            }, {\n                status: resp.status\n            });\n        }\n        const text = await resp.text();\n        console.log('📄 응답 텍스트:', text);\n        if (!text) {\n            console.warn('⚠️ 빈 응답');\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                data: []\n            });\n        }\n        let data;\n        try {\n            data = JSON.parse(text);\n        } catch (parseError) {\n            console.error('❌ JSON 파싱 오류:', parseError);\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: '유효하지 않은 JSON 응답'\n            }, {\n                status: 500\n            });\n        }\n        console.log('✅ 파싱된 데이터:', data);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(data, {\n            status: 200\n        });\n    } catch (error) {\n        console.error('❌ 프록시 오류:', error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: '서버 오류가 발생했습니다'\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL25ld3MvdHJlbmRpbmcvcm91dGUuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBdUQ7QUFFdkQsTUFBTUUsT0FBT0MsUUFBUUMsR0FBRyxDQUFDQyxhQUFhLElBQUk7QUFFbkMsZUFBZUMsSUFBSUMsR0FBRztJQUMzQixJQUFJO1FBQ0ZDLFFBQVFDLEdBQUcsQ0FBQywyQkFBMkJOLFFBQVFDLEdBQUcsQ0FBQ0MsYUFBYTtRQUNoRUcsUUFBUUMsR0FBRyxDQUFDLGdCQUFnQlA7UUFFNUIsTUFBTSxFQUFFUSxNQUFNLEVBQUUsR0FBRyxJQUFJQyxJQUFJSixJQUFJSyxHQUFHO1FBQ2xDLE1BQU1BLE1BQU0sR0FBR1YsS0FBSyxrQkFBa0IsRUFBRVEsUUFBUTtRQUVoREYsUUFBUUMsR0FBRyxDQUFDLGtCQUFrQkc7UUFFOUIsTUFBTUMsT0FBTyxNQUFNQyxNQUFNRixLQUFLO1lBQzVCRyxTQUFTO2dCQUFFLGdCQUFnQjtZQUFtQjtZQUM5Q0MsT0FBTztRQUNUO1FBRUFSLFFBQVFDLEdBQUcsQ0FBQyxhQUFhSSxLQUFLSSxNQUFNLEVBQUVKLEtBQUtLLFVBQVU7UUFFckQsSUFBSSxDQUFDTCxLQUFLTSxFQUFFLEVBQUU7WUFDWlgsUUFBUVksS0FBSyxDQUFDLGdCQUFnQlAsS0FBS0ksTUFBTSxFQUFFSixLQUFLSyxVQUFVO1lBQzFELE9BQU9qQixxREFBWUEsQ0FBQ29CLElBQUksQ0FDdEI7Z0JBQUVELE9BQU8sQ0FBQyxXQUFXLEVBQUVQLEtBQUtJLE1BQU0sQ0FBQyxDQUFDLEVBQUVKLEtBQUtLLFVBQVUsRUFBRTtZQUFDLEdBQ3hEO2dCQUFFRCxRQUFRSixLQUFLSSxNQUFNO1lBQUM7UUFFMUI7UUFFQSxNQUFNSyxPQUFPLE1BQU1ULEtBQUtTLElBQUk7UUFDNUJkLFFBQVFDLEdBQUcsQ0FBQyxjQUFjYTtRQUUxQixJQUFJLENBQUNBLE1BQU07WUFDVGQsUUFBUWUsSUFBSSxDQUFDO1lBQ2IsT0FBT3RCLHFEQUFZQSxDQUFDb0IsSUFBSSxDQUFDO2dCQUFFRyxNQUFNLEVBQUU7WUFBQztRQUN0QztRQUVBLElBQUlBO1FBQ0osSUFBSTtZQUNGQSxPQUFPQyxLQUFLQyxLQUFLLENBQUNKO1FBQ3BCLEVBQUUsT0FBT0ssWUFBWTtZQUNuQm5CLFFBQVFZLEtBQUssQ0FBQyxpQkFBaUJPO1lBQy9CLE9BQU8xQixxREFBWUEsQ0FBQ29CLElBQUksQ0FDdEI7Z0JBQUVELE9BQU87WUFBa0IsR0FDM0I7Z0JBQUVILFFBQVE7WUFBSTtRQUVsQjtRQUVBVCxRQUFRQyxHQUFHLENBQUMsY0FBY2U7UUFDMUIsT0FBT3ZCLHFEQUFZQSxDQUFDb0IsSUFBSSxDQUFDRyxNQUFNO1lBQUVQLFFBQVE7UUFBSTtJQUUvQyxFQUFFLE9BQU9HLE9BQU87UUFDZFosUUFBUVksS0FBSyxDQUFDLGFBQWFBO1FBQzNCLE9BQU9uQixxREFBWUEsQ0FBQ29CLElBQUksQ0FDdEI7WUFBRUQsT0FBTztRQUFnQixHQUN6QjtZQUFFSCxRQUFRO1FBQUk7SUFFbEI7QUFDRiIsInNvdXJjZXMiOlsiL1VzZXJzL3l1ZGFldW4vZGV2L0JFMDktRmluYWwtMXRlYW0vQkUwOS1GaW5hbC0xdGVhbS1GRS9hcHAvYXBpL25ld3MvdHJlbmRpbmcvcm91dGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlcXVlc3QsIE5leHRSZXNwb25zZSB9IGZyb20gJ25leHQvc2VydmVyJ1xuXG5jb25zdCBCQVNFID0gcHJvY2Vzcy5lbnYuTkVXU19CQVNFX1VSTCB8fCAnaHR0cDovL2xvY2FsaG9zdDo4MDgyJ1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKHJlcSkge1xuICB0cnkge1xuICAgIGNvbnNvbGUubG9nKCfwn5SnIO2ZmOqyvSDrs4DsiJggTkVXU19CQVNFX1VSTDonLCBwcm9jZXNzLmVudi5ORVdTX0JBU0VfVVJMKVxuICAgIGNvbnNvbGUubG9nKCfwn5SnIOq4sOuzuOqwkiBCQVNFOicsIEJBU0UpXG4gICAgXG4gICAgY29uc3QgeyBzZWFyY2ggfSA9IG5ldyBVUkwocmVxLnVybClcbiAgICBjb25zdCB1cmwgPSBgJHtCQVNFfS9hcGkvbmV3cy90cmVuZGluZyR7c2VhcmNofWBcbiAgICBcbiAgICBjb25zb2xlLmxvZygn8J+UlyDtlITroZ3si5wg7JqU7LKtIFVSTDonLCB1cmwpXG4gICAgXG4gICAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKHVybCwgeyBcbiAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LCBcbiAgICAgIGNhY2hlOiAnbm8tc3RvcmUnIFxuICAgIH0pXG4gICAgXG4gICAgY29uc29sZS5sb2coJ/Cfk6Eg7J2R64u1IOyDge2DnDonLCByZXNwLnN0YXR1cywgcmVzcC5zdGF0dXNUZXh0KVxuICAgIFxuICAgIGlmICghcmVzcC5vaykge1xuICAgICAgY29uc29sZS5lcnJvcign4p2MIEFQSSDsnZHri7Ug7Jik66WYOicsIHJlc3Auc3RhdHVzLCByZXNwLnN0YXR1c1RleHQpXG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICAgIHsgZXJyb3I6IGBBUEkg7JqU7LKtIOyLpO2MqDogJHtyZXNwLnN0YXR1c30gJHtyZXNwLnN0YXR1c1RleHR9YCB9LFxuICAgICAgICB7IHN0YXR1czogcmVzcC5zdGF0dXMgfVxuICAgICAgKVxuICAgIH1cbiAgICBcbiAgICBjb25zdCB0ZXh0ID0gYXdhaXQgcmVzcC50ZXh0KClcbiAgICBjb25zb2xlLmxvZygn8J+ThCDsnZHri7Ug7YWN7Iqk7Yq4OicsIHRleHQpXG4gICAgXG4gICAgaWYgKCF0ZXh0KSB7XG4gICAgICBjb25zb2xlLndhcm4oJ+KaoO+4jyDruYgg7J2R64u1JylcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGRhdGE6IFtdIH0pXG4gICAgfVxuICAgIFxuICAgIGxldCBkYXRhXG4gICAgdHJ5IHtcbiAgICAgIGRhdGEgPSBKU09OLnBhcnNlKHRleHQpXG4gICAgfSBjYXRjaCAocGFyc2VFcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcign4p2MIEpTT04g7YyM7IuxIOyYpOulmDonLCBwYXJzZUVycm9yKVxuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgICB7IGVycm9yOiAn7Jyg7Zqo7ZWY7KeAIOyViuydgCBKU09OIOydkeuLtScgfSxcbiAgICAgICAgeyBzdGF0dXM6IDUwMCB9XG4gICAgICApXG4gICAgfVxuICAgIFxuICAgIGNvbnNvbGUubG9nKCfinIUg7YyM7Iux65CcIOuNsOydtO2EsDonLCBkYXRhKVxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihkYXRhLCB7IHN0YXR1czogMjAwIH0pXG4gICAgXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcign4p2MIO2UhOuhneyLnCDsmKTrpZg6JywgZXJyb3IpXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgeyBlcnJvcjogJ+yEnOuyhCDsmKTrpZjqsIAg67Cc7IOd7ZaI7Iq164uI64ukJyB9LFxuICAgICAgeyBzdGF0dXM6IDUwMCB9XG4gICAgKVxuICB9XG59XG4iXSwibmFtZXMiOlsiTmV4dFJlcXVlc3QiLCJOZXh0UmVzcG9uc2UiLCJCQVNFIiwicHJvY2VzcyIsImVudiIsIk5FV1NfQkFTRV9VUkwiLCJHRVQiLCJyZXEiLCJjb25zb2xlIiwibG9nIiwic2VhcmNoIiwiVVJMIiwidXJsIiwicmVzcCIsImZldGNoIiwiaGVhZGVycyIsImNhY2hlIiwic3RhdHVzIiwic3RhdHVzVGV4dCIsIm9rIiwiZXJyb3IiLCJqc29uIiwidGV4dCIsIndhcm4iLCJkYXRhIiwiSlNPTiIsInBhcnNlIiwicGFyc2VFcnJvciJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/news/trending/route.js\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fnews%2Ftrending%2Froute&page=%2Fapi%2Fnews%2Ftrending%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fnews%2Ftrending%2Froute.js&appDir=%2FUsers%2Fyudaeun%2Fdev%2FBE09-Final-1team%2FBE09-Final-1team-FE%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyudaeun%2Fdev%2FBE09-Final-1team%2FBE09-Final-1team-FE&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fnews%2Ftrending%2Froute&page=%2Fapi%2Fnews%2Ftrending%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fnews%2Ftrending%2Froute.js&appDir=%2FUsers%2Fyudaeun%2Fdev%2FBE09-Final-1team%2FBE09-Final-1team-FE%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyudaeun%2Fdev%2FBE09-Final-1team%2FBE09-Final-1team-FE&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_yudaeun_dev_BE09_Final_1team_BE09_Final_1team_FE_app_api_news_trending_route_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/news/trending/route.js */ \"(rsc)/./app/api/news/trending/route.js\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/news/trending/route\",\n        pathname: \"/api/news/trending\",\n        filename: \"route\",\n        bundlePath: \"app/api/news/trending/route\"\n    },\n    resolvedPagePath: \"/Users/yudaeun/dev/BE09-Final-1team/BE09-Final-1team-FE/app/api/news/trending/route.js\",\n    nextConfigOutput,\n    userland: _Users_yudaeun_dev_BE09_Final_1team_BE09_Final_1team_FE_app_api_news_trending_route_js__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZuZXdzJTJGdHJlbmRpbmclMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRm5ld3MlMkZ0cmVuZGluZyUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRm5ld3MlMkZ0cmVuZGluZyUyRnJvdXRlLmpzJmFwcERpcj0lMkZVc2VycyUyRnl1ZGFldW4lMkZkZXYlMkZCRTA5LUZpbmFsLTF0ZWFtJTJGQkUwOS1GaW5hbC0xdGVhbS1GRSUyRmFwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9JTJGVXNlcnMlMkZ5dWRhZXVuJTJGZGV2JTJGQkUwOS1GaW5hbC0xdGVhbSUyRkJFMDktRmluYWwtMXRlYW0tRkUmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQStGO0FBQ3ZDO0FBQ3FCO0FBQ3NDO0FBQ25IO0FBQ0E7QUFDQTtBQUNBLHdCQUF3Qix5R0FBbUI7QUFDM0M7QUFDQSxjQUFjLGtFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsc0RBQXNEO0FBQzlEO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQzBGOztBQUUxRiIsInNvdXJjZXMiOlsiIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCIvVXNlcnMveXVkYWV1bi9kZXYvQkUwOS1GaW5hbC0xdGVhbS9CRTA5LUZpbmFsLTF0ZWFtLUZFL2FwcC9hcGkvbmV3cy90cmVuZGluZy9yb3V0ZS5qc1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvbmV3cy90cmVuZGluZy9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL25ld3MvdHJlbmRpbmdcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL25ld3MvdHJlbmRpbmcvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCIvVXNlcnMveXVkYWV1bi9kZXYvQkUwOS1GaW5hbC0xdGVhbS9CRTA5LUZpbmFsLTF0ZWFtLUZFL2FwcC9hcGkvbmV3cy90cmVuZGluZy9yb3V0ZS5qc1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHdvcmtBc3luY1N0b3JhZ2UsXG4gICAgICAgIHdvcmtVbml0QXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fnews%2Ftrending%2Froute&page=%2Fapi%2Fnews%2Ftrending%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fnews%2Ftrending%2Froute.js&appDir=%2FUsers%2Fyudaeun%2Fdev%2FBE09-Final-1team%2FBE09-Final-1team-FE%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyudaeun%2Fdev%2FBE09-Final-1team%2FBE09-Final-1team-FE&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fnews%2Ftrending%2Froute&page=%2Fapi%2Fnews%2Ftrending%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fnews%2Ftrending%2Froute.js&appDir=%2FUsers%2Fyudaeun%2Fdev%2FBE09-Final-1team%2FBE09-Final-1team-FE%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyudaeun%2Fdev%2FBE09-Final-1team%2FBE09-Final-1team-FE&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();