Feature: Buscar Vídeo por ID

  Scenario: Buscar Vídeo cadastrado por ID
    Given que seja informado um ID de vídeo já cadastrado
    When realizada a busca do vídeo por ID
    Then os dados do vídeo cadastrado devem ser retornados

  Scenario: Buscar Vídeo por ID não cadastrado
    Given que seja informado um ID de vídeo não cadastrado
    When realizada a busca do vídeo por ID
    Then uma exceção informando que o vídeo não foi encontrado deve ser lançada
