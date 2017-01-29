import {GitHub} from "github-api";

const gh = new GitHub({
    username: 'pbr-oc',
    token: '4315da0b3997935fbe9113992c8133aecea23657'
});
export default (gh as GitHub);

