var client = new APIClient("ws://localhost:9002");
client.getEventually("my_name", (name) => {
    console.log("My new name is " + name);
});
