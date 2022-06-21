let currentService;

module.exports.start = (service) => {
  currentService = service;

  console.clear();
  
  logo();

  listCommands();
};

function logo() {
  console.log(`\n
\t##########################
\t##   ___                ##
\t##  / __)  #-al220007-# ##
\t##  \\_ \\        ___     ##
\t## (___/tretagy/ __)    ##
\t##             \\_ \\     ##
\t## #-${currentService.name}-# (___/teps ##
\t##                      ##
\t##########################
  \n`);
}

function listCommands() {
  currentService.commands?.help?.execution(currentService).then(obj => {
    console.log(obj.message ?? '');
    currentService.readline.prompt();
  });
}
