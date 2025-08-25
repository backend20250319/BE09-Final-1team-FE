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
exports.id = "app/api/news/trending-keywords/route";
exports.ids = ["app/api/news/trending-keywords/route"];
exports.modules = {

/***/ "(rsc)/./app/api/news/trending-keywords/route.js":
/*!*************************************************!*\
  !*** ./app/api/news/trending-keywords/route.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@19.0.0_react@19.0.0__react@19.0.0/node_modules/next/dist/api/server.js\");\n\nasync function GET(request) {\n    try {\n        const { searchParams } = new URL(request.url);\n        const limit = searchParams.get('limit') || '10';\n        const period = searchParams.get('period') || '24h';\n        // 임시로 더미 트렌딩 키워드 데이터 반환\n        // 실제로는 백엔드 API에서 가져와야 함\n        const mockTrendingKeywords = {\n            keywords: [\n                {\n                    keyword: '인공지능',\n                    rank: 1,\n                    diff: 2\n                },\n                {\n                    keyword: '부동산',\n                    rank: 2,\n                    diff: -1\n                },\n                {\n                    keyword: '주식',\n                    rank: 3,\n                    diff: 1\n                },\n                {\n                    keyword: '코로나19',\n                    rank: 4,\n                    diff: 0\n                },\n                {\n                    keyword: '기술',\n                    rank: 5,\n                    diff: 3\n                },\n                {\n                    keyword: '정치',\n                    rank: 6,\n                    diff: -2\n                },\n                {\n                    keyword: '경제',\n                    rank: 7,\n                    diff: 0\n                },\n                {\n                    keyword: '사회',\n                    rank: 8,\n                    diff: 1\n                },\n                {\n                    keyword: '문화',\n                    rank: 9,\n                    diff: 0\n                },\n                {\n                    keyword: '스포츠',\n                    rank: 10,\n                    diff: -1\n                }\n            ]\n        };\n        console.log('🔥 트렌딩 키워드 요청:', {\n            limit,\n            period\n        });\n        console.log('✅ 트렌딩 키워드 응답:', mockTrendingKeywords);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(mockTrendingKeywords);\n    } catch (error) {\n        console.error('❌ 트렌딩 키워드 조회 실패:', error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: '트렌딩 키워드를 불러오는데 실패했습니다.'\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL25ld3MvdHJlbmRpbmcta2V5d29yZHMvcm91dGUuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBMEM7QUFFbkMsZUFBZUMsSUFBSUMsT0FBTztJQUMvQixJQUFJO1FBQ0YsTUFBTSxFQUFFQyxZQUFZLEVBQUUsR0FBRyxJQUFJQyxJQUFJRixRQUFRRyxHQUFHO1FBQzVDLE1BQU1DLFFBQVFILGFBQWFJLEdBQUcsQ0FBQyxZQUFZO1FBQzNDLE1BQU1DLFNBQVNMLGFBQWFJLEdBQUcsQ0FBQyxhQUFhO1FBRTdDLHdCQUF3QjtRQUN4Qix3QkFBd0I7UUFDeEIsTUFBTUUsdUJBQXVCO1lBQzNCQyxVQUFVO2dCQUNSO29CQUFFQyxTQUFTO29CQUFRQyxNQUFNO29CQUFHQyxNQUFNO2dCQUFFO2dCQUNwQztvQkFBRUYsU0FBUztvQkFBT0MsTUFBTTtvQkFBR0MsTUFBTSxDQUFDO2dCQUFFO2dCQUNwQztvQkFBRUYsU0FBUztvQkFBTUMsTUFBTTtvQkFBR0MsTUFBTTtnQkFBRTtnQkFDbEM7b0JBQUVGLFNBQVM7b0JBQVNDLE1BQU07b0JBQUdDLE1BQU07Z0JBQUU7Z0JBQ3JDO29CQUFFRixTQUFTO29CQUFNQyxNQUFNO29CQUFHQyxNQUFNO2dCQUFFO2dCQUNsQztvQkFBRUYsU0FBUztvQkFBTUMsTUFBTTtvQkFBR0MsTUFBTSxDQUFDO2dCQUFFO2dCQUNuQztvQkFBRUYsU0FBUztvQkFBTUMsTUFBTTtvQkFBR0MsTUFBTTtnQkFBRTtnQkFDbEM7b0JBQUVGLFNBQVM7b0JBQU1DLE1BQU07b0JBQUdDLE1BQU07Z0JBQUU7Z0JBQ2xDO29CQUFFRixTQUFTO29CQUFNQyxNQUFNO29CQUFHQyxNQUFNO2dCQUFFO2dCQUNsQztvQkFBRUYsU0FBUztvQkFBT0MsTUFBTTtvQkFBSUMsTUFBTSxDQUFDO2dCQUFFO2FBQ3RDO1FBQ0g7UUFFQUMsUUFBUUMsR0FBRyxDQUFDLGtCQUFrQjtZQUFFVDtZQUFPRTtRQUFPO1FBQzlDTSxRQUFRQyxHQUFHLENBQUMsaUJBQWlCTjtRQUU3QixPQUFPVCxxREFBWUEsQ0FBQ2dCLElBQUksQ0FBQ1A7SUFDM0IsRUFBRSxPQUFPUSxPQUFPO1FBQ2RILFFBQVFHLEtBQUssQ0FBQyxvQkFBb0JBO1FBQ2xDLE9BQU9qQixxREFBWUEsQ0FBQ2dCLElBQUksQ0FDdEI7WUFBRUMsT0FBTztRQUF5QixHQUNsQztZQUFFQyxRQUFRO1FBQUk7SUFFbEI7QUFDRiIsInNvdXJjZXMiOlsiL1VzZXJzL3l1ZGFldW4vZGV2L0JFMDktRmluYWwtMXRlYW0vQkUwOS1GaW5hbC0xdGVhbS1GRS9hcHAvYXBpL25ld3MvdHJlbmRpbmcta2V5d29yZHMvcm91dGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlc3BvbnNlIH0gZnJvbSAnbmV4dC9zZXJ2ZXInXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBHRVQocmVxdWVzdCkge1xuICB0cnkge1xuICAgIGNvbnN0IHsgc2VhcmNoUGFyYW1zIH0gPSBuZXcgVVJMKHJlcXVlc3QudXJsKVxuICAgIGNvbnN0IGxpbWl0ID0gc2VhcmNoUGFyYW1zLmdldCgnbGltaXQnKSB8fCAnMTAnXG4gICAgY29uc3QgcGVyaW9kID0gc2VhcmNoUGFyYW1zLmdldCgncGVyaW9kJykgfHwgJzI0aCdcbiAgICBcbiAgICAvLyDsnoTsi5zroZwg642U66+4IO2KuOugjOuUqSDtgqTsm4zrk5wg642w7J207YSwIOuwmO2ZmFxuICAgIC8vIOyLpOygnOuhnOuKlCDrsLHsl5Trk5wgQVBJ7JeQ7IScIOqwgOyguOyZgOyVvCDtlahcbiAgICBjb25zdCBtb2NrVHJlbmRpbmdLZXl3b3JkcyA9IHtcbiAgICAgIGtleXdvcmRzOiBbXG4gICAgICAgIHsga2V5d29yZDogJ+yduOqzteyngOuKpScsIHJhbms6IDEsIGRpZmY6IDIgfSxcbiAgICAgICAgeyBrZXl3b3JkOiAn67aA64+Z7IKwJywgcmFuazogMiwgZGlmZjogLTEgfSxcbiAgICAgICAgeyBrZXl3b3JkOiAn7KO87IudJywgcmFuazogMywgZGlmZjogMSB9LFxuICAgICAgICB7IGtleXdvcmQ6ICfsvZTroZzrgpgxOScsIHJhbms6IDQsIGRpZmY6IDAgfSxcbiAgICAgICAgeyBrZXl3b3JkOiAn6riw7IigJywgcmFuazogNSwgZGlmZjogMyB9LFxuICAgICAgICB7IGtleXdvcmQ6ICfsoJXsuZgnLCByYW5rOiA2LCBkaWZmOiAtMiB9LFxuICAgICAgICB7IGtleXdvcmQ6ICfqsr3soJwnLCByYW5rOiA3LCBkaWZmOiAwIH0sXG4gICAgICAgIHsga2V5d29yZDogJ+yCrO2ajCcsIHJhbms6IDgsIGRpZmY6IDEgfSxcbiAgICAgICAgeyBrZXl3b3JkOiAn66y47ZmUJywgcmFuazogOSwgZGlmZjogMCB9LFxuICAgICAgICB7IGtleXdvcmQ6ICfsiqTtj6zsuKAnLCByYW5rOiAxMCwgZGlmZjogLTEgfVxuICAgICAgXVxuICAgIH1cbiAgICBcbiAgICBjb25zb2xlLmxvZygn8J+UpSDtirjroIzrlKkg7YKk7JuM65OcIOyalOyyrTonLCB7IGxpbWl0LCBwZXJpb2QgfSlcbiAgICBjb25zb2xlLmxvZygn4pyFIO2KuOugjOuUqSDtgqTsm4zrk5wg7J2R64u1OicsIG1vY2tUcmVuZGluZ0tleXdvcmRzKVxuICAgIFxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihtb2NrVHJlbmRpbmdLZXl3b3JkcylcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCfinYwg7Yq466CM65SpIO2CpOybjOuTnCDsobDtmowg7Iuk7YyoOicsIGVycm9yKVxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcbiAgICAgIHsgZXJyb3I6ICftirjroIzrlKkg7YKk7JuM65Oc66W8IOu2iOufrOyYpOuKlOuNsCDsi6TtjKjtlojsirXri4jri6QuJyB9LFxuICAgICAgeyBzdGF0dXM6IDUwMCB9XG4gICAgKVxuICB9XG59XG4iXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwiR0VUIiwicmVxdWVzdCIsInNlYXJjaFBhcmFtcyIsIlVSTCIsInVybCIsImxpbWl0IiwiZ2V0IiwicGVyaW9kIiwibW9ja1RyZW5kaW5nS2V5d29yZHMiLCJrZXl3b3JkcyIsImtleXdvcmQiLCJyYW5rIiwiZGlmZiIsImNvbnNvbGUiLCJsb2ciLCJqc29uIiwiZXJyb3IiLCJzdGF0dXMiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/news/trending-keywords/route.js\n");

/***/ }),

/***/ "(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@19.0.0_react@19.0.0__react@19.0.0/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fnews%2Ftrending-keywords%2Froute&page=%2Fapi%2Fnews%2Ftrending-keywords%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fnews%2Ftrending-keywords%2Froute.js&appDir=%2FUsers%2Fyudaeun%2Fdev%2FBE09-Final-1team%2FBE09-Final-1team-FE%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyudaeun%2Fdev%2FBE09-Final-1team%2FBE09-Final-1team-FE&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/next@15.2.4_react-dom@19.0.0_react@19.0.0__react@19.0.0/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fnews%2Ftrending-keywords%2Froute&page=%2Fapi%2Fnews%2Ftrending-keywords%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fnews%2Ftrending-keywords%2Froute.js&appDir=%2FUsers%2Fyudaeun%2Fdev%2FBE09-Final-1team%2FBE09-Final-1team-FE%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyudaeun%2Fdev%2FBE09-Final-1team%2FBE09-Final-1team-FE&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@19.0.0_react@19.0.0__react@19.0.0/node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@19.0.0_react@19.0.0__react@19.0.0/node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@19.0.0_react@19.0.0__react@19.0.0/node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_yudaeun_dev_BE09_Final_1team_BE09_Final_1team_FE_app_api_news_trending_keywords_route_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/news/trending-keywords/route.js */ \"(rsc)/./app/api/news/trending-keywords/route.js\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/news/trending-keywords/route\",\n        pathname: \"/api/news/trending-keywords\",\n        filename: \"route\",\n        bundlePath: \"app/api/news/trending-keywords/route\"\n    },\n    resolvedPagePath: \"/Users/yudaeun/dev/BE09-Final-1team/BE09-Final-1team-FE/app/api/news/trending-keywords/route.js\",\n    nextConfigOutput,\n    userland: _Users_yudaeun_dev_BE09_Final_1team_BE09_Final_1team_FE_app_api_news_trending_keywords_route_js__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvLnBucG0vbmV4dEAxNS4yLjRfcmVhY3QtZG9tQDE5LjAuMF9yZWFjdEAxOS4wLjBfX3JlYWN0QDE5LjAuMC9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZuZXdzJTJGdHJlbmRpbmcta2V5d29yZHMlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRm5ld3MlMkZ0cmVuZGluZy1rZXl3b3JkcyUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRm5ld3MlMkZ0cmVuZGluZy1rZXl3b3JkcyUyRnJvdXRlLmpzJmFwcERpcj0lMkZVc2VycyUyRnl1ZGFldW4lMkZkZXYlMkZCRTA5LUZpbmFsLTF0ZWFtJTJGQkUwOS1GaW5hbC0xdGVhbS1GRSUyRmFwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9JTJGVXNlcnMlMkZ5dWRhZXVuJTJGZGV2JTJGQkUwOS1GaW5hbC0xdGVhbSUyRkJFMDktRmluYWwtMXRlYW0tRkUmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQStGO0FBQ3ZDO0FBQ3FCO0FBQytDO0FBQzVIO0FBQ0E7QUFDQTtBQUNBLHdCQUF3Qix5R0FBbUI7QUFDM0M7QUFDQSxjQUFjLGtFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsc0RBQXNEO0FBQzlEO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQzBGOztBQUUxRiIsInNvdXJjZXMiOlsiIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCIvVXNlcnMveXVkYWV1bi9kZXYvQkUwOS1GaW5hbC0xdGVhbS9CRTA5LUZpbmFsLTF0ZWFtLUZFL2FwcC9hcGkvbmV3cy90cmVuZGluZy1rZXl3b3Jkcy9yb3V0ZS5qc1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvbmV3cy90cmVuZGluZy1rZXl3b3Jkcy9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL25ld3MvdHJlbmRpbmcta2V5d29yZHNcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL25ld3MvdHJlbmRpbmcta2V5d29yZHMvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCIvVXNlcnMveXVkYWV1bi9kZXYvQkUwOS1GaW5hbC0xdGVhbS9CRTA5LUZpbmFsLTF0ZWFtLUZFL2FwcC9hcGkvbmV3cy90cmVuZGluZy1rZXl3b3Jkcy9yb3V0ZS5qc1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHdvcmtBc3luY1N0b3JhZ2UsXG4gICAgICAgIHdvcmtVbml0QXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@19.0.0_react@19.0.0__react@19.0.0/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fnews%2Ftrending-keywords%2Froute&page=%2Fapi%2Fnews%2Ftrending-keywords%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fnews%2Ftrending-keywords%2Froute.js&appDir=%2FUsers%2Fyudaeun%2Fdev%2FBE09-Final-1team%2FBE09-Final-1team-FE%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyudaeun%2Fdev%2FBE09-Final-1team%2FBE09-Final-1team-FE&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@19.0.0_react@19.0.0__react@19.0.0/node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!*********************************************************************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/next@15.2.4_react-dom@19.0.0_react@19.0.0__react@19.0.0/node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \*********************************************************************************************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/.pnpm/next@15.2.4_react-dom@19.0.0_react@19.0.0__react@19.0.0/node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!*********************************************************************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/next@15.2.4_react-dom@19.0.0_react@19.0.0__react@19.0.0/node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \*********************************************************************************************************************************************************************************/
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
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next@15.2.4_react-dom@19.0.0_react@19.0.0__react@19.0.0"], () => (__webpack_exec__("(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@19.0.0_react@19.0.0__react@19.0.0/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fnews%2Ftrending-keywords%2Froute&page=%2Fapi%2Fnews%2Ftrending-keywords%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fnews%2Ftrending-keywords%2Froute.js&appDir=%2FUsers%2Fyudaeun%2Fdev%2FBE09-Final-1team%2FBE09-Final-1team-FE%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyudaeun%2Fdev%2FBE09-Final-1team%2FBE09-Final-1team-FE&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();