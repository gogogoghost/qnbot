function before() {
    console.log('before')
}

function after(res) {
    console.log('after');
    console.log(res);
}

module.exports={
    before,
    after
}