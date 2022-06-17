let currentService;

module.exports.start = (service) => {
  currentService = service;

  console.clear();
  
  logo();

  listCommands();

  return service.init();
};

function logo() {
  console.log(`
\t##########################
\t##   ___                ##
\t##  / __)  #-al220007-# ##
\t##  \\_ \\        ___     ##
\t## (___/tretagy/ __)    ##
\t##             \\_ \\     ##
\t## #-${currentService.name}-# (___/teps ##
\t##                      ##
\t##########################
  `);
}

function listCommands() {
  const help = currentService.commands?.help?.execution(currentService);

  console.log(help?.message ?? '');
}