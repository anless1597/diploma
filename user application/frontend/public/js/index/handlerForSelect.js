export  function handleFilteringDevices(e) {
    const type = e.target.value;
    if (type === "") {
        location.href = `http://localhost:80/`;
        return;
    }
    location.href = `http://localhost:80/?filterType=${type}`;
}