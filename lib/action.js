"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const get = (url, token) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, node_fetch_1.default)(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    if (!~[200, 204].indexOf(response.status)) {
        const text = yield response.text();
        let message = `[${response.status}] ${text || '(no body)'} at ${url}`;
        try {
            const result = JSON.parse(text);
            if (result.message)
                message = `[${response.status}] ${result.message} at ${url}`;
        }
        catch (err) { }
        throw new Error(message);
    }
    const result = yield response.json();
    if (result.error)
        throw new Error(`${result.message}`);
    return result;
});
function run() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const endpoint = core.getInput('endpoint') || 'https://api.cloudtype.io';
            const token = core.getInput('token');
            const ghtoken = core.getInput('ghtoken');
            const scope = core.getInput('scope');
            const repo = core.getInput('repo');
            const readOnly = core.getInput('readOnly') === 'true' ? true : false;
            if (!ghtoken)
                throw new Error(`variable ghtoken(github token) is required`);
            if (!repo)
                throw new Error(`variable repo is required`);
            core.info(`⭐ Connect ${repo} with ${scope || '(your)'} scope ghtoken is ${ghtoken}`);
            const keyset = yield get(`${endpoint}/scope/${scope || '$user'}/deploykey?url=git@github.com:${repo}.git`, token);
            const sshkey = keyset.sshkey;
            const keycompare = sshkey.split(' ')[0] + ' ' + sshkey.split(' ')[1];
            core.info(`👀 Deploy Key is ${sshkey}`);
            const octokit = github.getOctokit(ghtoken);
            const deploykeys = yield octokit.request(`GET /repos/${repo}/keys`);
            let deploykey = (_a = deploykeys === null || deploykeys === void 0 ? void 0 : deploykeys.data) === null || _a === void 0 ? void 0 : _a.find((deploykey) => deploykey.key === keycompare);
            // remove key if diff read_only
            if (deploykey && deploykey.read_only !== readOnly) {
                core.info(`💀 Delete key for rewrite`);
                yield octokit.request(`DELETE /repos/${repo}/keys/${deploykey.id}`);
                deploykey = null;
            }
            // create deploy key if not found
            if (!deploykey) {
                core.info(`👉 Write key`);
                yield octokit.request(`POST /repos/${repo}/keys`, {
                    key: sshkey,
                    read_only: readOnly
                });
            }
            core.info('✅ Success - init');
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
