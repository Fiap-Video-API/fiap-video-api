Feature: Cadastro de vídeo

  Scenario: Cadastro de vídeo com sucesso
    Given que o usuário fornece um ID de usuário, email, status, path do vídeo e download válidos
    When o usuário solicita o cadastro
    Then o vídeo é cadastrado com sucesso
    And o sistema retorna um ID válido

  Scenario: Cadastro de vídeo com ID de usuário já cadastrado
    Given que o usuário fornece um ID de usuário já cadastrado
    When o usuário solicita o cadastro
    Then uma exceção informando que o ID de usuário já existe deve ser lançada

  Scenario: Cadastro de vídeo com path inválido
    Given que o usuário fornece um path do vídeo inválido
    When o usuário solicita o cadastro
    Then uma exceção informando que o path do vídeo é inválido deve ser lançada

  Scenario: Cadastro de vídeo com ID de usuário inválido
    Given que o usuário fornece um ID de usuário inválido
    When o usuário solicita o cadastro
    Then uma exceção informando que o ID de usuário é inválido deve ser lançada

  Scenario: Cadastro de vídeo com status inválido
    Given que o usuário fornece um status inválido
    When o usuário solicita o cadastro
    Then uma exceção informando que o status do vídeo é inválido deve ser lançada
